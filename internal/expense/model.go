package expense

import "time"

type Expense struct {
	ID             string    `json:"id"`
	OrganizationID string    `json:"organization_id"`
	Category       string    `json:"category"` // maintenance, cleaning, electricity, water, elevator, other
	Amount         float64   `json:"amount"`
	Date           time.Time `json:"date"`
	Description    string    `json:"description"`
	ReceiptURL     string    `json:"receipt_url,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type CreateRequest struct {
	Category    string  `json:"category"`
	Amount      float64 `json:"amount"`
	Date        string  `json:"date"` // YYYY-MM-DD
	Description string  `json:"description"`
	ReceiptURL  string  `json:"receipt_url,omitempty"`
}
