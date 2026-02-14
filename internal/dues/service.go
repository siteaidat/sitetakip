package dues

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

func (s *Service) Create(orgID string, req CreateRequest) (*Due, error) {
	if req.UnitID == "" || req.Amount <= 0 || req.DueDate == "" {
		return nil, fmt.Errorf("unit_id, amount, and due_date are required")
	}

	dueDate, err := time.Parse("2006-01-02", req.DueDate)
	if err != nil {
		return nil, fmt.Errorf("invalid due_date format, use YYYY-MM-DD")
	}

	d := &Due{
		OrganizationID: orgID,
		UnitID:         req.UnitID,
		Amount:         req.Amount,
		DueDate:        dueDate,
		Status:         "pending",
		Description:    req.Description,
	}

	if err := s.repo.Create(d); err != nil {
		return nil, err
	}
	return d, nil
}

func (s *Service) BulkCreate(orgID string, req BulkCreateRequest) (int, error) {
	if req.Amount <= 0 || req.DueDate == "" {
		return 0, fmt.Errorf("amount and due_date are required")
	}

	dueDate, err := time.Parse("2006-01-02", req.DueDate)
	if err != nil {
		return 0, fmt.Errorf("invalid due_date format, use YYYY-MM-DD")
	}

	return s.repo.BulkCreate(orgID, req.Amount, dueDate, req.Description)
}

func (s *Service) GetByID(id string) (*Due, error) {
	return s.repo.GetByID(id)
}

func (s *Service) List(filter ListFilter) ([]Due, error) {
	return s.repo.List(filter)
}

func (s *Service) MarkPaid(id string, method string) error {
	if method == "" {
		method = "cash"
	}
	return s.repo.MarkPaid(id, method)
}

func (s *Service) MarkOverdue() (int, error) {
	return s.repo.MarkOverdue()
}

func (s *Service) GetOverdue(orgID string) ([]Due, error) {
	return s.repo.GetOverdue(orgID)
}
