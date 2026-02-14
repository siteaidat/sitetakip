package dues

import "github.com/go-chi/chi/v5"

func RegisterRoutes(r chi.Router, h *Handler) {
	r.Route("/organizations/{orgId}/dues", func(r chi.Router) {
		r.Post("/", h.Create)
		r.Post("/bulk", h.BulkCreate)
		r.Get("/", h.List)
		r.Get("/overdue", h.GetOverdue)
		r.Get("/{id}", h.Get)
		r.Patch("/{id}/pay", h.MarkPaid)
	})
}
