package unit

import "fmt"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(orgID string, req CreateRequest) (*Unit, error) {
	if req.UnitNumber == "" {
		return nil, fmt.Errorf("unit number is required")
	}

	u := &Unit{
		OrganizationID: orgID,
		UnitNumber:     req.UnitNumber,
		Floor:          req.Floor,
	}

	if err := s.repo.Create(u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) GetByID(id string) (*Unit, error) {
	return s.repo.GetByID(id)
}

func (s *Service) ListByOrganization(orgID string) ([]Unit, error) {
	return s.repo.ListByOrganization(orgID)
}

func (s *Service) Update(id string, req UpdateRequest) (*Unit, error) {
	return s.repo.Update(id, req)
}

func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}
