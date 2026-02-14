package expense

import (
	"fmt"
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(orgID string, req CreateRequest) (*Expense, error) {
	if req.Category == "" || req.Amount <= 0 || req.Date == "" {
		return nil, fmt.Errorf("category, amount, and date are required")
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format, use YYYY-MM-DD")
	}

	e := &Expense{
		OrganizationID: orgID,
		Category:       req.Category,
		Amount:         req.Amount,
		Date:           date,
		Description:    req.Description,
		ReceiptURL:     req.ReceiptURL,
	}

	if err := s.repo.Create(e); err != nil {
		return nil, err
	}
	return e, nil
}

func (s *Service) GetByID(id string) (*Expense, error) {
	return s.repo.GetByID(id)
}

func (s *Service) ListByOrganization(orgID string, year, month int) ([]Expense, error) {
	return s.repo.ListByOrganization(orgID, year, month)
}

func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}
