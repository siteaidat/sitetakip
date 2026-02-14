package report

import "github.com/go-chi/chi/v5"

func RegisterRoutes(r chi.Router, h *Handler) {
	r.Route("/organizations/{orgId}/reports", func(r chi.Router) {
		r.Get("/monthly", h.MonthlySummary)
		r.Get("/expenses", h.ExpenseBreakdown)
	})
}
