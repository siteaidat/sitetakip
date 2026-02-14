package organization

import "fmt"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(managerID string, req CreateRequest) (*Organization, error) {
	if req.Name == "" {
		return nil, fmt.Errorf("name is required")
	}

	org := &Organization{
		Name:             req.Name,
		Address:          req.Address,
		TotalUnits:       req.TotalUnits,
		MonthlyDueAmount: req.MonthlyDueAmount,
		ManagerID:        managerID,
	}

	if err := s.repo.Create(org); err != nil {
		return nil, err
	}
	return org, nil
}

func (s *Service) GetByID(id string) (*Organization, error) {
	return s.repo.GetByID(id)
}

func (s *Service) ListByManager(managerID string) ([]Organization, error) {
	return s.repo.ListByManager(managerID)
}

func (s *Service) Update(id string, req UpdateRequest) (*Organization, error) {
	return s.repo.Update(id, req)
}

func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}
