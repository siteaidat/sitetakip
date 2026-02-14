package payment

import "log"

// Service handles payment provider integration (iyzico, Param, etc.)
// This is a stub that will be implemented when payment integration is needed.
type Service struct {
	// provider config will be added
}

func NewService() *Service {
	return &Service{}
}

// CreatePaymentLink generates a payment link for a due (stub)
func (s *Service) CreatePaymentLink(dueID string, amount float64, description string) (string, error) {
	// TODO: Integrate with iyzico or Param
	log.Printf("[PAYMENT STUB] Due: %s, Amount: %.2f", dueID, amount)
	return "", nil
}
