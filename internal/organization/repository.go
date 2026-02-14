package organization

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

func (r *Repository) Create(org *Organization) error {
	query := `
		INSERT INTO organizations (name, address, total_units, monthly_due_amount, manager_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at`

	return r.db.QueryRow(query,
		org.Name, org.Address, org.TotalUnits, org.MonthlyDueAmount, org.ManagerID,
	).Scan(&org.ID, &org.CreatedAt, &org.UpdatedAt)
}

func (r *Repository) GetByID(id string) (*Organization, error) {
	org := &Organization{}
	query := `SELECT id, name, address, total_units, monthly_due_amount, manager_id, created_at, updated_at
		FROM organizations WHERE id = $1`

	err := r.db.QueryRow(query, id).Scan(
		&org.ID, &org.Name, &org.Address, &org.TotalUnits,
		&org.MonthlyDueAmount, &org.ManagerID, &org.CreatedAt, &org.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("organization not found")
		}
		return nil, err
	}
	return org, nil
}

func (r *Repository) ListByManager(managerID string) ([]Organization, error) {
	query := `SELECT id, name, address, total_units, monthly_due_amount, manager_id, created_at, updated_at
		FROM organizations WHERE manager_id = $1 ORDER BY name`

	rows, err := r.db.Query(query, managerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orgs []Organization
	for rows.Next() {
		var org Organization
		if err := rows.Scan(
			&org.ID, &org.Name, &org.Address, &org.TotalUnits,
			&org.MonthlyDueAmount, &org.ManagerID, &org.CreatedAt, &org.UpdatedAt,
		); err != nil {
			return nil, err
		}
		orgs = append(orgs, org)
	}
	return orgs, nil
}

func (r *Repository) Update(id string, req UpdateRequest) (*Organization, error) {
	org, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		org.Name = *req.Name
	}
	if req.Address != nil {
		org.Address = *req.Address
	}
	if req.TotalUnits != nil {
		org.TotalUnits = *req.TotalUnits
	}
	if req.MonthlyDueAmount != nil {
		org.MonthlyDueAmount = *req.MonthlyDueAmount
	}

	query := `UPDATE organizations SET name=$1, address=$2, total_units=$3, monthly_due_amount=$4, updated_at=NOW()
		WHERE id=$5 RETURNING updated_at`

	err = r.db.QueryRow(query, org.Name, org.Address, org.TotalUnits, org.MonthlyDueAmount, id).Scan(&org.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return org, nil
}

func (r *Repository) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM organizations WHERE id = $1", id)
	return err
}
