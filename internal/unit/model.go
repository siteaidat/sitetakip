package unit

import "time"

type Unit struct {
	ID             string    `json:"id"`
	OrganizationID string    `json:"organization_id"`
	UnitNumber     string    `json:"unit_number"`
	Floor          int       `json:"floor"`
	ResidentID     *string   `json:"resident_id,omitempty"`
	ResidentName   string    `json:"resident_name,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type CreateRequest struct {
	UnitNumber string `json:"unit_number"`
	Floor      int    `json:"floor"`
}

type UpdateRequest struct {
	UnitNumber *string `json:"unit_number,omitempty"`
	Floor      *int    `json:"floor,omitempty"`
	ResidentID *string `json:"resident_id,omitempty"`
}
