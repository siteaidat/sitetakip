package unit

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

func (r *Repository) Create(u *Unit) error {
	query := `
		INSERT INTO units (organization_id, unit_number, floor, resident_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at`

	return r.db.QueryRow(query,
		u.OrganizationID, u.UnitNumber, u.Floor, u.ResidentID,
	).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
}

func (r *Repository) GetByID(id string) (*Unit, error) {
	u := &Unit{}
	query := `SELECT u.id, u.organization_id, u.unit_number, u.floor, u.resident_id,
		COALESCE(us.full_name, '') as resident_name, u.created_at, u.updated_at
		FROM units u LEFT JOIN users us ON u.resident_id = us.id
		WHERE u.id = $1`

	err := r.db.QueryRow(query, id).Scan(
		&u.ID, &u.OrganizationID, &u.UnitNumber, &u.Floor,
		&u.ResidentID, &u.ResidentName, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("unit not found")
		}
		return nil, err
	}
	return u, nil
}

func (r *Repository) ListByOrganization(orgID string) ([]Unit, error) {
	query := `SELECT u.id, u.organization_id, u.unit_number, u.floor, u.resident_id,
		COALESCE(us.full_name, '') as resident_name, u.created_at, u.updated_at
		FROM units u LEFT JOIN users us ON u.resident_id = us.id
		WHERE u.organization_id = $1 ORDER BY u.floor, u.unit_number`

	rows, err := r.db.Query(query, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var units []Unit
	for rows.Next() {
		var u Unit
		if err := rows.Scan(
			&u.ID, &u.OrganizationID, &u.UnitNumber, &u.Floor,
			&u.ResidentID, &u.ResidentName, &u.CreatedAt, &u.UpdatedAt,
		); err != nil {
			return nil, err
		}
		units = append(units, u)
	}
	return units, nil
}

func (r *Repository) Update(id string, req UpdateRequest) (*Unit, error) {
	u, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.UnitNumber != nil {
		u.UnitNumber = *req.UnitNumber
	}
	if req.Floor != nil {
		u.Floor = *req.Floor
	}
	if req.ResidentID != nil {
		u.ResidentID = req.ResidentID
	}

	query := `UPDATE units SET unit_number=$1, floor=$2, resident_id=$3, updated_at=NOW()
		WHERE id=$4 RETURNING updated_at`

	err = r.db.QueryRow(query, u.UnitNumber, u.Floor, u.ResidentID, id).Scan(&u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *Repository) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM units WHERE id = $1", id)
	return err
}
