package expense

import (
	"database/sql"
	"fmt"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(e *Expense) error {
	query := `
		INSERT INTO expenses (organization_id, category, amount, date, description, receipt_url)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at`

	return r.db.QueryRow(query,
		e.OrganizationID, e.Category, e.Amount, e.Date, e.Description, e.ReceiptURL,
	).Scan(&e.ID, &e.CreatedAt, &e.UpdatedAt)
}

func (r *Repository) GetByID(id string) (*Expense, error) {
	e := &Expense{}
	query := `SELECT id, organization_id, category, amount, date, description,
		COALESCE(receipt_url, '') as receipt_url, created_at, updated_at
		FROM expenses WHERE id = $1`

	err := r.db.QueryRow(query, id).Scan(
		&e.ID, &e.OrganizationID, &e.Category, &e.Amount,
		&e.Date, &e.Description, &e.ReceiptURL, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("expense not found")
		}
		return nil, err
	}
	return e, nil
}

func (r *Repository) ListByOrganization(orgID string, year, month int) ([]Expense, error) {
	query := `SELECT id, organization_id, category, amount, date, description,
		COALESCE(receipt_url, '') as receipt_url, created_at, updated_at
		FROM expenses WHERE organization_id = $1`

	args := []interface{}{orgID}
	argIdx := 2

	if year > 0 {
		query += fmt.Sprintf(" AND EXTRACT(YEAR FROM date) = $%d", argIdx)
		args = append(args, year)
		argIdx++
	}
	if month > 0 {
		query += fmt.Sprintf(" AND EXTRACT(MONTH FROM date) = $%d", argIdx)
		args = append(args, month)
		argIdx++
	}

	query += " ORDER BY date DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var expenses []Expense
	for rows.Next() {
		var e Expense
		if err := rows.Scan(
			&e.ID, &e.OrganizationID, &e.Category, &e.Amount,
			&e.Date, &e.Description, &e.ReceiptURL, &e.CreatedAt, &e.UpdatedAt,
		); err != nil {
			return nil, err
		}
		expenses = append(expenses, e)
	}
	return expenses, nil
}

func (r *Repository) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM expenses WHERE id = $1", id)
	return err
}
