.PHONY: help install build up down restart logs clean test lint format db-migrate db-reset frontend-install frontend-dev backend-install backend-dev embed-install embed-dev

# Default target
help:
	@echo "CareerPilot Development Commands"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make restart         - Restart all services"
	@echo "  make logs            - Show logs from all services"
	@echo "  make logs-backend    - Show backend logs"
	@echo "  make logs-frontend   - Show frontend logs"
	@echo "  make logs-db         - Show database logs"
	@echo "  make logs-redis      - Show redis logs"
	@echo "  make logs-embed      - Show embedding service logs"
	@echo "  make clean           - Remove all containers and volumes"
	@echo "  make build           - Build all Docker images"
	@echo "  make rebuild         - Rebuild all Docker images"
	@echo ""
	@echo "Development Commands:"
	@echo "  make frontend-install - Install frontend dependencies"
	@echo "  make frontend-dev     - Start frontend development server"
	@echo "  make backend-install  - Install backend dependencies"
	@echo "  make backend-dev      - Start backend development server"
	@echo "  make embed-install    - Install embedding service dependencies"
	@echo "  make embed-dev        - Start embedding service development server"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-migrate       - Run database migrations"
	@echo "  make db-reset         - Reset database to initial state"
	@echo "  make db-backup        - Backup database"
	@echo "  make db-restore       - Restore database from backup"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test             - Run all tests"
	@echo "  make test-backend     - Run backend tests"
	@echo "  make test-frontend    - Run frontend tests"
	@echo "  make lint             - Run linters"
	@echo "  make format           - Format code"
	@echo ""
	@echo "Utilities:"
	@echo "  make install          - Install all dependencies"
	@echo "  make shell-backend    - Open shell in backend container"
	@echo "  make shell-db         - Open shell in database container"
	@echo "  make shell-redis      - Open shell in redis container"

# Docker Commands
up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f db

logs-redis:
	docker-compose logs -f redis

logs-embed:
	docker-compose logs -f embed

clean:
	docker-compose down -v
	docker system prune -f

build:
	docker-compose build

rebuild:
	docker-compose build --no-cache

# Development Commands
install: frontend-install backend-install embed-install

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

backend-install:
	cd backend && python -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt

backend-dev:
	cd backend && . venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

embed-install:
	cd embed && python -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt

embed-dev:
	cd embed && . venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Database Commands
db-migrate:
	docker-compose exec backend alembic upgrade head

db-reset:
	docker-compose exec -T db psql -U cpuser -d careerpilot < db/init.sql
	docker-compose exec backend alembic upgrade head

db-backup:
	docker-compose exec -T db pg_dump -U cpuser careerpilot > backup_$$(date +%Y%m%d_%H%M%S).sql

db-restore:
	@echo "Usage: make db-restore BACKUP=backup_file.sql"
	docker-compose exec -T db psql -U cpuser -d careerpilot < $(BACKUP)

# Testing & Quality
test: test-backend test-frontend

test-backend:
	cd backend && . venv/bin/activate && pytest

test-frontend:
	cd frontend && npm test

lint:
	cd backend && . venv/bin/activate && pylint app/
	cd frontend && npm run lint

format:
	cd backend && . venv/bin/activate && black app/
	cd frontend && npm run format

# Utilities
shell-backend:
	docker-compose exec backend /bin/bash

shell-db:
	docker-compose exec db /bin/bash

shell-redis:
	docker-compose exec redis /bin/bash

# Production
prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f
