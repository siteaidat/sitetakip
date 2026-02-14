package report

import (
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/mustafakemalcelik/sitetakip/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) MonthlySummary(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	now := time.Now()

	year, _ := strconv.Atoi(r.URL.Query().Get("year"))
	month, _ := strconv.Atoi(r.URL.Query().Get("month"))
	if year == 0 {
		year = now.Year()
	}
	if month == 0 {
		month = int(now.Month())
	}

	summary, err := h.service.GetMonthlySummary(orgID, year, month)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, summary)
}

func (h *Handler) ExpenseBreakdown(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	now := time.Now()

	year, _ := strconv.Atoi(r.URL.Query().Get("year"))
	month, _ := strconv.Atoi(r.URL.Query().Get("month"))
	if year == 0 {
		year = now.Year()
	}
	if month == 0 {
		month = int(now.Month())
	}

	breakdown, err := h.service.GetExpenseBreakdown(orgID, year, month)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, breakdown)
}
