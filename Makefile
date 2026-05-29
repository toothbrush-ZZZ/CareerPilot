SHELL := /bin/bash
.DEFAULT_GOAL := dev

FRONTEND_DIR := frontend
COMPOSE_BACKEND := db redis embed backend

.PHONY: help dev dev-down install-frontend frontend-dev frontend-build frontend-env \
	docker-up docker-down docker-rebuild backend-dev embed-dev run start

help:
	@printf "CareerPilot Makefile targets:\n"
	@printf "  dev (default)      Start backend (Docker) + frontend (npm) together\n"
	@printf "  run / start        Alias for dev\n"
	@printf "  dev-down           Stop backend Docker services started by dev\n"
	@printf "  install-frontend   Install frontend dependencies\n"
	@printf "  frontend-dev       Start only the frontend development server\n"
	@printf "  frontend-build     Build the frontend for production\n"
	@printf "  frontend-env       Create frontend/.env.local with default API URL\n"
	@printf "  docker-up          Start the full stack in Docker (all services)\n"
	@printf "  docker-down        Stop docker compose services\n"
	@printf "  docker-rebuild     Rebuild and restart all Docker services\n"
	@printf "  backend-dev        Start only the backend stack via docker compose\n"
	@printf "  embed-dev          Start only the embed service via docker compose\n"

install-frontend:
	cd $(FRONTEND_DIR) && npm install

frontend-dev:
	cd $(FRONTEND_DIR) && npm run dev

frontend-build:
	cd $(FRONTEND_DIR) && npm run build

frontend-env:
	@if [ -f "$(FRONTEND_DIR)/.env.local" ]; then \
		echo "$(FRONTEND_DIR)/.env.local already exists"; \
	else \
		echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > $(FRONTEND_DIR)/.env.local; \
		echo "Created $(FRONTEND_DIR)/.env.local with default backend URL"; \
	fi

docker-up:
	docker compose up --build

docker-down:
	docker compose down

docker-rebuild:
	docker compose up --build --force-recreate --renew-anon-volumes

# One command: backend stack in Docker, frontend with hot reload on the host.
dev: frontend-env
	@if [ ! -d "$(FRONTEND_DIR)/node_modules" ]; then \
		$(MAKE) install-frontend; \
	fi
	@echo "Starting backend stack (db, redis, embed, backend)..."
	@docker compose up --build -d $(COMPOSE_BACKEND)
	@echo "Backend API: http://localhost:8000"
	@echo "Frontend:    http://localhost:3000"
	@trap '$(MAKE) -s dev-down' INT TERM EXIT; \
	cd $(FRONTEND_DIR) && npm run dev

dev-down:
	@docker compose stop $(COMPOSE_BACKEND) 2>/dev/null || true

run: dev

start: dev

backend-dev:
	docker compose up --build $(COMPOSE_BACKEND)

embed-dev:
	docker compose up --build embed
