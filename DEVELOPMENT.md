# Development Guide

This guide walks through setting up a local development environment, understanding the workspace workflow, and working with the key development tools used in this project.

For architecture context, see [ARCHITECTURE.md](./ARCHITECTURE.md).  
For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Prerequisites

| Tool | Version | Purpose |
| --- | --- | --- |
| **Node.js** | >= 20.0.0 | Runtime for all JavaScript tooling |
| **pnpm** | >= 9.0.0 | Package manager and workspace orchestrator |
| **Docker** | Latest | Full-stack environment simulation |
| **Git** | Latest | Source control + Husky pre-push hooks |

Verify your setup:

```bash
node --version    # should be >= 20
pnpm --version    # should be >= 9
docker --version  # any recent version
```

---

## Initial Setup

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Build all shared packages (must happen before running apps)
pnpm build:packages

# 3. Set up environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/website/.env.example apps/website/.env
cp apps/admin/.env.example apps/admin/.env

# 4. Generate Prisma client and run migrations with seed data
pnpm prisma:setup

# 5. Start all services in development mode
pnpm dev
```

After setup, the services are available at:

| Service | URL |
| --- | --- |
| **Website** | http://localhost:3000 |
| **Admin Panel** | http://localhost:3001 |
| **Backend API** | http://localhost:4000 |
| **GraphQL Playground** | http://localhost:4000/graphql |
| **File uploads** | http://localhost:4000/uploads/:filename |

---

## Environment Variables

Each application has its own `.env` file. Below are the key variables for local development.

### `apps/backend/.env`

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-local-jwt-secret"
JWT_REFRESH_SECRET="your-local-refresh-secret"
PORT=4000
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
CAPTCHA_ENABLED=false
EMAIL_ENABLED=false
UPLOAD_DIR=uploads
```

### `apps/website/.env`

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
GRAPHQL_INTERNAL_URL=http://localhost:4000/graphql
```

### `apps/admin/.env`

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
GRAPHQL_INTERNAL_URL=http://localhost:4000/graphql
API_URL=http://localhost:4000
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

> In development, `GRAPHQL_INTERNAL_URL` and `NEXT_PUBLIC_GRAPHQL_URL` can be the same value since there is no Docker network to route through.

---

## Running Individual Services

While `pnpm dev` starts everything, you can run individual services during focused development:

```bash
# Backend only
pnpm --filter backend dev

# Website only (packages must be built first)
pnpm --filter website dev

# Admin only (packages must be built first)
pnpm --filter admin dev

# Rebuild a specific package
pnpm --filter @repo/ui build
pnpm --filter @repo/validation build
pnpm --filter @repo/graphql build
```

---

## Package Development Workflow

When making changes to a shared package, consumers must see the rebuilt output. The typical workflow is:

```bash
# Make changes to e.g. @repo/validation
# Then rebuild it
pnpm --filter @repo/validation build

# Or rebuild all packages at once
pnpm build:packages

# If you're doing rapid iteration on a package, run its watcher:
pnpm --filter @repo/ui exec tsc --watch
```

> **Note:** `pnpm dev` from the monorepo root does not rebuild packages automatically when their source changes. You must rebuild packages manually and restart the consuming app.

---

## Database Management

All Prisma commands are proxied through the root `package.json` scripts for convenience.

```bash
# Generate Prisma client (run after schema.prisma changes)
pnpm prisma:generate

# Apply migrations and seed the database (first-time setup)
pnpm prisma:setup

# Create a new migration after schema changes
pnpm prisma:migrate

# Reset the database and re-seed (destroys all data)
pnpm prisma:reset

# Seed without migrating
pnpm prisma:seed

# Open Prisma Studio (visual database browser)
pnpm --filter backend exec prisma studio

# Manage admin user accounts (create, update, delete)
pnpm user:manage
```

### Modifying the Schema

1. Edit `apps/backend/prisma/schema.prisma`
2. Run `pnpm prisma:migrate` to create a migration and regenerate the client
3. Restart the backend: `pnpm --filter backend dev`

---

## GraphQL Workflow

### Regenerating Types

When the backend GraphQL schema changes, regenerate the `@repo/graphql` types:

```bash
# 1. Start the backend (needed to auto-generate schema.gql)
pnpm --filter backend dev

# 2. In a second terminal, generate the schema file
pnpm schema:generate

# 3. Regenerate TypeScript types from the schema
pnpm graphql:codegen

# 4. Rebuild the graphql package
pnpm --filter @repo/graphql build
```

This is also run automatically by the pre-push hook.

### Adding a New Operation

1. Create or edit a `.graphql` file in `packages/graphql/src/queries/`
2. Run `pnpm graphql:codegen` to generate the typed document node
3. Import the generated document node in your app:

```ts
import { MyNewDocument } from "@repo/graphql";
```

---

## Type Checking

```bash
# Check types across all apps and packages
pnpm check:types

# Check a specific app
pnpm check:types:website
pnpm check:types:admin
pnpm check:types:backend
```

---

## Linting

```bash
# Lint all apps and packages
pnpm check:lint

# Lint a specific app
pnpm check:lint:admin
pnpm check:lint:website
pnpm check:lint:backend
```

---

## Schema Sync Check

Verify that the backend GraphQL schema is in sync with its source resolvers:

```bash
pnpm check:schema
```

This script checks if any staged backend files (resolvers, DTOs, entities) are missing a corresponding update to `apps/backend/src/schema.gql`.

---

## Running All Checks

```bash
# Run type check + lint together
pnpm check:all
```

This is equivalent to what the pre-push hook runs (minus codegen).

---

## Testing

```bash
# Run backend unit tests
pnpm --filter backend test

# Run backend unit tests in watch mode
pnpm --filter backend test:watch

# Run backend e2e tests
pnpm --filter backend test:e2e

# Generate coverage report
pnpm --filter backend test:cov
```

---

## Docker Development Environment

You can also run all services inside Docker with hot reload:

```bash
# Start the full stack in dev mode with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Initialize the database on first run
docker-compose exec backend pnpm prisma:setup

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f admin
docker-compose logs -f website

# Stop all services
docker-compose down
```

In Docker development mode:
- Source code is bind-mounted, so changes are reflected without rebuilding the image
- The backend debugger is exposed on port **9229** for VS Code attach
- `node_modules` live inside the container to avoid host OS conflicts

---

## Production Build (Local Simulation)

To simulate the production build locally:

```bash
# Build the backend schema, packages, and all apps
pnpm build:docker

# Spin up the production Docker stack
docker-compose up --build -d

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop and remove containers
docker-compose down
```

Access the production build at **http://localhost** (Nginx on port 80).

---

## VS Code Debugging

The backend exposes a debug port (`9229`) in Docker dev mode. To attach VS Code:

1. Add this to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Docker Backend",
  "port": 9229,
  "restart": true,
  "sourceMaps": true,
  "remoteRoot": "/app/apps/backend"
}
```

2. Start Docker dev mode, then press **F5** in VS Code.

---

## Common Issues

### "Cannot find module '@repo/ui'"

The shared packages need to be built first:

```bash
pnpm build:packages
```

### "Prisma Client not found"

Regenerate the Prisma client:

```bash
pnpm prisma:generate
```

### "GraphQL types are stale"

Regenerate the `@repo/graphql` types:

```bash
pnpm schema:generate && pnpm graphql:codegen && pnpm --filter @repo/graphql build
```

### "Type errors after changing a Zod schema"

Rebuild the validation package:

```bash
pnpm validation:rebuild
```
