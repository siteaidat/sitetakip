package resident

import "fmt"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(req CreateRequest) (*Resident, error) {
	if req.FullName == "" || req.Phone == "" {
		return nil, fmt.Errorf("full name and phone are required")
	}

	var unitID *string
	if req.UnitID != "" {
		unitID = &req.UnitID
	}

	res := &Resident{
		FullName: req.FullName,
		Phone:    req.Phone,
		Email:    req.Email,
		UnitID:   unitID,
	}

	if err := s.repo.Create(res); err != nil {
		return nil, err
	}
	return res, nil
}

func (s *Service) GetByID(id string) (*Resident, error) {
	return s.repo.GetByID(id)
}

func (s *Service) ListByOrganization(orgID string) ([]Resident, error) {
	return s.repo.ListByOrganization(orgID)
}

func (s *Service) Update(id string, req UpdateRequest) (*Resident, error) {
	return s.repo.Update(id, req)
}

func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}
