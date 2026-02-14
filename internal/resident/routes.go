package resident

import "github.com/go-chi/chi/v5"

func RegisterRoutes(r chi.Router, h *Handler) {
	r.Route("/organizations/{orgId}/residents", func(r chi.Router) {
		r.Post("/", h.Create)
		r.Get("/", h.List)
	})
	r.Route("/residents", func(r chi.Router) {
		r.Get("/{id}", h.Get)
		r.Put("/{id}", h.Update)
		r.Delete("/{id}", h.Delete)
	})
}
