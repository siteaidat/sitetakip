package organization

import "time"

type Organization struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Address        string    `json:"address"`
	TotalUnits     int       `json:"total_units"`
	MonthlyDueAmount float64 `json:"monthly_due_amount"`
	ManagerID      string    `json:"manager_id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type CreateRequest struct {
	Name             string  `json:"name"`
	Address          string  `json:"address"`
	TotalUnits       int     `json:"total_units"`
	MonthlyDueAmount float64 `json:"monthly_due_amount"`
}

type UpdateRequest struct {
	Name             *string  `json:"name,omitempty"`
	Address          *string  `json:"address,omitempty"`
	TotalUnits       *int     `json:"total_units,omitempty"`
	MonthlyDueAmount *float64 `json:"monthly_due_amount,omitempty"`
}
