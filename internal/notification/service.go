package notification

import (
	"fmt"
	"log"
	"net/url"
)

type Service struct {
	// SMS provider config will be added later (Netgsm, etc.)
}

func NewService() *Service {
	return &Service{}
}

// GenerateWhatsAppLink creates a WhatsApp message link for a resident
func (s *Service) GenerateWhatsAppLink(phone string, message string) string {
	// Remove leading zero, add Turkey country code
	if len(phone) > 0 && phone[0] == '0' {
		phone = "90" + phone[1:]
	}
	return fmt.Sprintf("https://wa.me/%s?text=%s", phone, url.QueryEscape(message))
}

// SendSMS sends an SMS via configured provider (stub for now)
func (s *Service) SendSMS(phone string, message string) error {
	// TODO: Integrate with Netgsm or Ileti Merkezi
	log.Printf("[SMS STUB] To: %s, Message: %s", phone, message)
	return nil
}

// FormatDueReminder creates a standardized due reminder message
func (s *Service) FormatDueReminder(residentName string, unitNumber string, amount float64, dueDate string) string {
	return fmt.Sprintf(
		"Sayın %s, %s nolu dairenizin %s tarihli %.2f TL tutarındaki aidatı henüz ödenmemiştir. Lütfen en kısa sürede ödemenizi yapınız.",
		residentName, unitNumber, dueDate, amount,
	)
}
