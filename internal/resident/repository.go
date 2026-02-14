package resident

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

func (r *Repository) Create(res *Resident) error {
	query := `
		INSERT INTO residents (full_name, phone, email, unit_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at`

	return r.db.QueryRow(query,
		res.FullName, res.Phone, res.Email, res.UnitID,
	).Scan(&res.ID, &res.CreatedAt, &res.UpdatedAt)
}

func (r *Repository) GetByID(id string) (*Resident, error) {
	res := &Resident{}
	query := `SELECT id, full_name, phone, email, unit_id, created_at, updated_at
		FROM residents WHERE id = $1`

	err := r.db.QueryRow(query, id).Scan(
		&res.ID, &res.FullName, &res.Phone, &res.Email,
		&res.UnitID, &res.CreatedAt, &res.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("resident not found")
		}
		return nil, err
	}
	return res, nil
}

func (r *Repository) ListByOrganization(orgID string) ([]Resident, error) {
	query := `SELECT r.id, r.full_name, r.phone, r.email, r.unit_id, r.created_at, r.updated_at
		FROM residents r
		JOIN units u ON r.unit_id = u.id
		WHERE u.organization_id = $1
		ORDER BY r.full_name`

	rows, err := r.db.Query(query, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var residents []Resident
	for rows.Next() {
		var res Resident
		if err := rows.Scan(
			&res.ID, &res.FullName, &res.Phone, &res.Email,
			&res.UnitID, &res.CreatedAt, &res.UpdatedAt,
		); err != nil {
			return nil, err
		}
		residents = append(residents, res)
	}
	return residents, nil
}

func (r *Repository) Update(id string, req UpdateRequest) (*Resident, error) {
	res, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.FullName != nil {
		res.FullName = *req.FullName
	}
	if req.Phone != nil {
		res.Phone = *req.Phone
	}
	if req.Email != nil {
		res.Email = *req.Email
	}
	if req.UnitID != nil {
		res.UnitID = req.UnitID
	}

	query := `UPDATE residents SET full_name=$1, phone=$2, email=$3, unit_id=$4, updated_at=NOW()
		WHERE id=$5 RETURNING updated_at`

	err = r.db.QueryRow(query, res.FullName, res.Phone, res.Email, res.UnitID, id).Scan(&res.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (r *Repository) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM residents WHERE id = $1", id)
	return err
}
