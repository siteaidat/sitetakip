package main

import (
	"log"
	"net/http"
	"os"

	"github.com/mustafakemalcelik/sitetakip/internal/auth"
	"github.com/mustafakemalcelik/sitetakip/internal/dues"
	"github.com/mustafakemalcelik/sitetakip/internal/expense"
	"github.com/mustafakemalcelik/sitetakip/internal/notification"
	"github.com/mustafakemalcelik/sitetakip/internal/organization"
	"github.com/mustafakemalcelik/sitetakip/internal/report"
	"github.com/mustafakemalcelik/sitetakip/internal/resident"
	"github.com/mustafakemalcelik/sitetakip/internal/unit"
	"github.com/mustafakemalcelik/sitetakip/pkg/database"
	"github.com/mustafakemalcelik/sitetakip/pkg/logger"
	"github.com/mustafakemalcelik/sitetakip/pkg/middleware"
	"github.com/mustafakemalcelik/sitetakip/pkg/response"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

func main() {
	// Load config
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/sitetakip?sslmode=disable"
	}

	// Connect to database
	db, err := database.Connect(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize router
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimw.Recoverer)
	r.Use(chimw.RequestID)
	r.Use(middleware.StructuredLogger)
	r.Use(middleware.CORS())

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		response.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Initialize modules
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)

	orgRepo := organization.NewRepository(db)
	orgService := organization.NewService(orgRepo)
	orgHandler := organization.NewHandler(orgService)

	unitRepo := unit.NewRepository(db)
	unitService := unit.NewService(unitRepo)
	unitHandler := unit.NewHandler(unitService)

	residentRepo := resident.NewRepository(db)
	residentService := resident.NewService(residentRepo)
	residentHandler := resident.NewHandler(residentService)

	duesRepo := dues.NewRepository(db)
	duesService := dues.NewService(duesRepo)
	duesHandler := dues.NewHandler(duesService)

	expenseRepo := expense.NewRepository(db)
	expenseService := expense.NewService(expenseRepo)
	expenseHandler := expense.NewHandler(expenseService)

	notifService := notification.NewService()
	_ = notifService // will be used by dues service later

	reportService := report.NewService(db)
	reportHandler := report.NewHandler(reportService)

	// Register routes
	r.Route("/api/v1", func(r chi.Router) {
		auth.RegisterRoutes(r, authHandler)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(authService))

			organization.RegisterRoutes(r, orgHandler)
			unit.RegisterRoutes(r, unitHandler)
			resident.RegisterRoutes(r, residentHandler)
			dues.RegisterRoutes(r, duesHandler)
			expense.RegisterRoutes(r, expenseHandler)
			report.RegisterRoutes(r, reportHandler)
		})
	})

	logger.Info("server_start", map[string]string{"port": port})
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
