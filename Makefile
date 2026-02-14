.PHONY: dev dev-db dev-backend dev-frontend build test

# Start only Postgres
dev-db:
	docker compose up db -d

# Run backend locally (requires dev-db)
dev-backend:
	go run ./cmd/server/

# Run frontend locally
dev-frontend:
	cd frontend && npm run dev

# Run everything with Docker
dev:
	docker compose up --build

# Build backend binary
build:
	go build -o server ./cmd/server/

# Run tests
test:
	go test ./...

# Run migrations only
migrate:
	go run ./cmd/server/ -migrate
