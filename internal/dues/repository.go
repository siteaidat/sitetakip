package dues

import (
	"database/sql"
	"fmt"
	"time"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(d *Due) error {
	query := `
		INSERT INTO dues (organization_id, unit_id, amount, due_date, status, description)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at`

	return r.db.QueryRow(query,
		d.OrganizationID, d.UnitID, d.Amount, d.DueDate, d.Status, d.Description,
	).Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)
}

func (r *Repository) BulkCreate(orgID string, amount float64, dueDate time.Time, description string) (int, error) {
	query := `
		INSERT INTO dues (organization_id, unit_id, amount, due_date, status, description)
		SELECT $1, u.id, $2, $3, 'pending', $4
		FROM units u WHERE u.organization_id = $1`

	result, err := r.db.Exec(query, orgID, amount, dueDate, description)
	if err != nil {
		return 0, err
	}

	count, err := result.RowsAffected()
	return int(count), err
}

func (r *Repository) GetByID(id string) (*Due, error) {
	d := &Due{}
	query := `SELECT d.id, d.organization_id, d.unit_id,
		COALESCE(u.unit_number, '') as unit_number,
		COALESCE(res.full_name, '') as resident_name,
		d.amount, d.due_date, d.status, d.paid_at,
		COALESCE(d.payment_method, '') as payment_method,
		COALESCE(d.description, '') as description,
		d.created_at, d.updated_at
		FROM dues d
		LEFT JOIN units u ON d.unit_id = u.id
		LEFT JOIN residents res ON u.resident_id = res.id
		WHERE d.id = $1`

	err := r.db.QueryRow(query, id).Scan(
		&d.ID, &d.OrganizationID, &d.UnitID, &d.UnitNumber, &d.ResidentName,
		&d.Amount, &d.DueDate, &d.Status, &d.PaidAt,
		&d.PaymentMethod, &d.Description, &d.CreatedAt, &d.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("due not found")
		}
		return nil, err
	}
	return d, nil
}

func (r *Repository) List(filter ListFilter) ([]Due, error) {
	query := `SELECT d.id, d.organization_id, d.unit_id,
		COALESCE(u.unit_number, '') as unit_number,
		COALESCE(res.full_name, '') as resident_name,
		d.amount, d.due_date, d.status, d.paid_at,
		COALESCE(d.payment_method, '') as payment_method,
		COALESCE(d.description, '') as description,
		d.created_at, d.updated_at
		FROM dues d
		LEFT JOIN units u ON d.unit_id = u.id
		LEFT JOIN residents res ON u.resident_id = res.id
		WHERE d.organization_id = $1`

	args := []interface{}{filter.OrganizationID}
	argIdx := 2

	if filter.Status != "" {
		query += fmt.Sprintf(" AND d.status = $%d", argIdx)
		args = append(args, filter.Status)
		argIdx++
	}
	if filter.Year > 0 {
		query += fmt.Sprintf(" AND EXTRACT(YEAR FROM d.due_date) = $%d", argIdx)
		args = append(args, filter.Year)
		argIdx++
	}
	if filter.Month > 0 {
		query += fmt.Sprintf(" AND EXTRACT(MONTH FROM d.due_date) = $%d", argIdx)
		args = append(args, filter.Month)
		argIdx++
	}

	query += " ORDER BY d.due_date DESC, u.unit_number"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dues []Due
	for rows.Next() {
		var d Due
		if err := rows.Scan(
			&d.ID, &d.OrganizationID, &d.UnitID, &d.UnitNumber, &d.ResidentName,
			&d.Amount, &d.DueDate, &d.Status, &d.PaidAt,
			&d.PaymentMethod, &d.Description, &d.CreatedAt, &d.UpdatedAt,
		); err != nil {
			return nil, err
		}
		dues = append(dues, d)
	}
	return dues, nil
}

func (r *Repository) MarkPaid(id string, method string) error {
	query := `UPDATE dues SET status='paid', paid_at=NOW(), payment_method=$1, updated_at=NOW()
		WHERE id=$2`
	_, err := r.db.Exec(query, method, id)
	return err
}

func (r *Repository) MarkOverdue() (int, error) {
	query := `UPDATE dues SET status='overdue', updated_at=NOW()
		WHERE status='pending' AND due_date < CURRENT_DATE`
	result, err := r.db.Exec(query)
	if err != nil {
		return 0, err
	}
	count, err := result.RowsAffected()
	return int(count), err
}

func (r *Repository) GetOverdue(orgID string) ([]Due, error) {
	return r.List(ListFilter{OrganizationID: orgID, Status: "overdue"})
}
