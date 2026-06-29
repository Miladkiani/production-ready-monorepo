#!/bin/bash
# =============================================================================
# Fullstack Turborepo Starter - Docker Build Script
# =============================================================================
# Builds services sequentially in dependency order.
# =============================================================================

set -e

echo "=================================================="
echo "Fullstack Turborepo Starter - Docker Build"
echo "=================================================="
echo ""

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create .env file from .env.example"
    exit 1
fi

echo "✅ Environment file found"
echo ""

echo "🚀 Building services sequentially..."
echo ""

echo "   [1/3] Building backend..."
docker compose build backend

echo ""
echo "   [2/3] Building website..."
docker compose build website

echo ""
echo "   [3/3] Building admin..."
docker compose build admin

echo ""
echo "=================================================="
echo "✅ Build Complete!"
echo "=================================================="
echo ""
echo "🚀 Next Steps:"
echo "   1. Start services:  docker compose up -d"
echo "   2. View logs:       docker compose logs -f"
echo "   3. Check status:    docker compose ps"
echo "   4. Stop services:   docker compose down"
echo ""
echo "🌐 Access URLs (after starting services):"
echo "   Website:  https://yourdomain.com"
echo "   Admin:    https://yourdomain.com/admin"
echo "   Backend:  https://yourdomain.com/api/graphql"
echo ""
