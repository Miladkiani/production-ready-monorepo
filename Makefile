# ============================================
# 🎓 Makefile - Convenient Docker Commands
# ============================================
# Usage: make <command>
# Example: make dev-up

.PHONY: help dev-up dev-down prod-up prod-down build logs clean

# Default target
help:
	@echo "🐳 Docker Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev-up        - Start all services in dev mode (hot reload)"
	@echo "  make dev-down      - Stop dev services"
	@echo "  make dev-logs      - View dev logs"
	@echo "  make dev-restart   - Restart dev services"
	@echo ""
	@echo "Production:"
	@echo "  make prod-up       - Start all services in production mode"
	@echo "  make prod-down     - Stop production services"
	@echo "  make prod-logs     - View production logs"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate    - Run database migrations"
	@echo "  make db-seed       - Seed database with sample data"
	@echo "  make db-studio     - Open Prisma Studio"
	@echo "  make db-backup     - Backup database"
	@echo ""
	@echo "Maintenance:"
	@echo "  make build         - Build all Docker images"
	@echo "  make rebuild       - Rebuild images without cache"
	@echo "  make logs          - View all logs"
	@echo "  make clean         - Remove containers and volumes"
	@echo "  make prune         - Clean up Docker system"
	@echo ""

# ==========================================
# Development Commands
# ==========================================
dev-up:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

dev-down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

dev-restart:
	@echo "🔄 Restarting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart

# ==========================================
# Production Commands
# ==========================================
prod-up:
	@echo "🚀 Starting production environment..."
	docker-compose up -d

prod-down:
	@echo "🛑 Stopping production environment..."
	docker-compose down

prod-logs:
	docker-compose logs -f

# ==========================================
# Database Commands
# ==========================================
db-migrate:
	@echo "📦 Running database migrations..."
	docker-compose exec backend pnpm prisma migrate deploy

db-seed:
	@echo "🌱 Seeding database..."
	docker-compose exec backend pnpm prisma db seed

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	docker-compose exec backend pnpm prisma studio

db-backup:
	@echo "💾 Backing up database..."
	@mkdir -p backups
	docker run --rm -v my-career-monorepo_backend-db:/data -v $(PWD)/backups:/backup \
		alpine tar czf /backup/db-backup-$$(date +%Y%m%d-%H%M%S).tar.gz /data
	@echo "✅ Backup saved to backups/"

# ==========================================
# Build Commands
# ==========================================
build:
	@echo "🏗️  Building Docker images..."
	docker-compose build

rebuild:
	@echo "🔨 Rebuilding images without cache..."
	docker-compose build --no-cache

# ==========================================
# Maintenance Commands
# ==========================================
logs:
	docker-compose logs -f

clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v

prune:
	@echo "🗑️  Pruning Docker system..."
	docker system prune -a -f

# ==========================================
# Quick Commands
# ==========================================
shell-backend:
	docker-compose exec backend sh

shell-admin:
	docker-compose exec admin sh

shell-website:
	docker-compose exec website sh
