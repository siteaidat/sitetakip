package dues

import "time"

type Due struct {
	ID             string     `json:"id"`
	OrganizationID string     `json:"organization_id"`
	UnitID         string     `json:"unit_id"`
	UnitNumber     string     `json:"unit_number,omitempty"`
	ResidentName   string     `json:"resident_name,omitempty"`
	Amount         float64    `json:"amount"`
	DueDate        time.Time  `json:"due_date"`
	Status         string     `json:"status"` // pending, paid, overdue
	PaidAt         *time.Time `json:"paid_at,omitempty"`
	PaymentMethod  string     `json:"payment_method,omitempty"` // cash, transfer, online
	Description    string     `json:"description,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type CreateRequest struct {
	UnitID      string  `json:"unit_id"`
	Amount      float64 `json:"amount"`
	DueDate     string  `json:"due_date"` // YYYY-MM-DD
	Description string  `json:"description,omitempty"`
}

type BulkCreateRequest struct {
	Amount      float64 `json:"amount"`
	DueDate     string  `json:"due_date"`
	Description string  `json:"description,omitempty"`
}

type MarkPaidRequest struct {
	PaymentMethod string `json:"payment_method"`
}

type ListFilter struct {
	OrganizationID string
	Status         string
	Month          int
	Year           int
}
