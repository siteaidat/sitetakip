package report

import (
	"database/sql"
	"fmt"
)

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

type MonthlySummary struct {
	Month         int     `json:"month"`
	Year          int     `json:"year"`
	TotalDues     float64 `json:"total_dues"`
	TotalPaid     float64 `json:"total_paid"`
	TotalOverdue  float64 `json:"total_overdue"`
	TotalExpenses float64 `json:"total_expenses"`
	Balance       float64 `json:"balance"`
	PaidCount     int     `json:"paid_count"`
	PendingCount  int     `json:"pending_count"`
	OverdueCount  int     `json:"overdue_count"`
}

type ExpenseBreakdown struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Count    int     `json:"count"`
}

func (s *Service) GetMonthlySummary(orgID string, year, month int) (*MonthlySummary, error) {
	summary := &MonthlySummary{Month: month, Year: year}

	// Dues summary
	duesQuery := `
		SELECT
			COALESCE(SUM(amount), 0) as total,
			COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid,
			COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as overdue,
			COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
			COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
			COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
		FROM dues
		WHERE organization_id = $1
			AND EXTRACT(YEAR FROM due_date) = $2
			AND EXTRACT(MONTH FROM due_date) = $3`

	err := s.db.QueryRow(duesQuery, orgID, year, month).Scan(
		&summary.TotalDues, &summary.TotalPaid, &summary.TotalOverdue,
		&summary.PaidCount, &summary.PendingCount, &summary.OverdueCount,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get dues summary: %w", err)
	}

	// Expenses summary
	expenseQuery := `
		SELECT COALESCE(SUM(amount), 0)
		FROM expenses
		WHERE organization_id = $1
			AND EXTRACT(YEAR FROM date) = $2
			AND EXTRACT(MONTH FROM date) = $3`

	err = s.db.QueryRow(expenseQuery, orgID, year, month).Scan(&summary.TotalExpenses)
	if err != nil {
		return nil, fmt.Errorf("failed to get expense summary: %w", err)
	}

	summary.Balance = summary.TotalPaid - summary.TotalExpenses
	return summary, nil
}

func (s *Service) GetExpenseBreakdown(orgID string, year, month int) ([]ExpenseBreakdown, error) {
	query := `
		SELECT category, SUM(amount) as total, COUNT(*) as count
		FROM expenses
		WHERE organization_id = $1
			AND EXTRACT(YEAR FROM date) = $2
			AND EXTRACT(MONTH FROM date) = $3
		GROUP BY category
		ORDER BY total DESC`

	rows, err := s.db.Query(query, orgID, year, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var breakdown []ExpenseBreakdown
	for rows.Next() {
		var b ExpenseBreakdown
		if err := rows.Scan(&b.Category, &b.Amount, &b.Count); err != nil {
			return nil, err
		}
		breakdown = append(breakdown, b)
	}
	return breakdown, nil
}
