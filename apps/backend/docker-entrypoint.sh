#!/bin/sh
set -e

echo "🚀 Starting My Career Backend..."
echo ""

# Wait for volume to be ready
sleep 2

# Ensure data directory exists with correct permissions
mkdir -p /data
chmod 755 /data

# CRITICAL: Set DATABASE_URL explicitly for Prisma commands
# Prisma migrate deploy doesn't load prisma.config.ts, needs env var
export DATABASE_URL="${DATABASE_URL:-file:/data/production.db}"

echo "📋 Database configuration:"
echo "   DATABASE_URL: $DATABASE_URL"
echo ""

# Prisma binary location - use workspace root path since we're in /app/apps/backend
PRISMA_BIN="../../node_modules/.pnpm/node_modules/.bin/prisma"

# Verify Prisma installation
echo "📋 Prisma CLI version:"
$PRISMA_BIN --version | head -3 || echo "⚠️  Could not determine Prisma version"
echo ""

# Run database migrations
echo "📦 Running database migrations..."
$PRISMA_BIN migrate deploy
echo "✅ Migrations completed"
echo ""

# Seed database (show errors but continue if already seeded)
# Note: In production, we run the compiled seed.js directly instead of using
# 'prisma db seed' because that expects ts-node which isn't in production deps
echo "🌱 Seeding database..."
if node prisma/seed.js; then
  echo "✅ Seeding completed successfully"
else
  SEED_EXIT_CODE=$?
  echo "⚠️  Seeding failed with exit code: $SEED_EXIT_CODE"
  echo "⚠️  This might be normal if database is already seeded, or an error occurred"
  echo "⚠️  Check logs above for details"
fi
echo ""

# Start the application
echo "🚀 Starting NestJS application..."
exec node dist/main.js
