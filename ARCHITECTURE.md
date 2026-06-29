# Architecture

This document describes the system architecture of the Production-Ready Monorepo: how the applications are structured, how they communicate, how data flows through the system, and why specific engineering decisions were made.

For a higher-level summary, see the [root README](./README.md).

---

## System Overview

The monorepo is composed of three runtime applications and a suite of shared internal packages:

```text
                     ┌──────────────────────────┐
                     │         Internet          │
                     └────────────┬─────────────┘
                                  │ HTTPS
                     ┌────────────▼─────────────┐
                     │           Nginx           │
                     │    (Reverse Proxy / SSL)  │
                     └──┬──────────┬──────────┬──┘
                /admin  │  /api    │  /       │
          ┌─────▼──┐  ┌─▼───────┐  ┌─▼──────┐
          │ admin  │  │ backend │  │website │
          │ :3001  │  │  :4000  │  │ :3000  │
          └──┬─────┘  └──┬──────┘  └──┬─────┘
             │   S2S     │     S2S    │
             └───────────▼────────────┘
                  Internal Docker Network
```

All public traffic enters through **Nginx**, which handles SSL termination and routes requests by URL path:

- `/admin` → Admin Panel (Next.js on port 3001)
- `/api` → Backend API (NestJS on port 4000)
- `/` → Public Website (Next.js on port 3000)

---

## Request Flow Patterns

### Pattern 1: Public Website — Server-Side Rendering

```text
Browser
  │
  │  HTTPS GET /
  ▼
Nginx (SSL termination)
  │
  │  HTTP
  ▼
website:3000 (Next.js Server Component)
  │
  │  HTTP via GRAPHQL_INTERNAL_URL (bypasses Nginx)
  ▼
backend:4000 (NestJS GraphQL)
  │
  ▼
SQLite via Prisma
  │
  ▼  (data returns up the chain)
website renders complete HTML
  │
  ▼
Browser (fast TTFB, no client-side loading state)
```

The critical optimization is the **server-to-server (S2S) request**: the Next.js app communicates with the backend over the internal Docker network using `GRAPHQL_INTERNAL_URL`. This avoids a round-trip through Nginx, public DNS resolution, and SSL re-negotiation — measurably reducing Time to First Byte.

### Pattern 2: Public Website — Client-Side Interaction

```text
Browser
  │
  │  HTTPS POST /api/graphql  (e.g. contact form submission)
  ▼
Nginx
  │
  │  HTTP
  ▼
backend:4000 (NestJS GraphQL)
  │
  ▼
SQLite via Prisma → JSON response to browser
```

Interactive mutations are sent from the browser through the public Nginx-proxied GraphQL endpoint (`NEXT_PUBLIC_GRAPHQL_URL`).

### Pattern 3: Admin Dashboard — Authenticated Request

```text
Browser
  │
  │  HTTPS GET /admin/contact
  ▼
Nginx
  │
  │  HTTP
  ▼
admin:3001  middleware.ts (Edge Runtime)
  ├─ Read accessToken cookie
  ├─ Token valid? → attach to Authorization header → continue
  ├─ Token expired + refreshToken present?
  │       → POST backend:4000/graphql (refreshToken mutation, S2S)
  │       → set new accessToken cookie (15min)
  │       → set new refreshToken cookie (7d, sliding window)
  │       → inject { Authorization, x-auth-user } headers
  └─ No tokens → redirect to /login
        │
        ▼
   Server Component reads headers() → seeds AuthProvider props
        │
        │  HTTP via GRAPHQL_INTERNAL_URL
        ▼
   backend:4000 — verifies JWT from Authorization header
        │
        ▼
   HTML delivered to browser with auth state pre-initialized
```

---

## Package Dependency Graph

Shared packages are built once and consumed by all apps. The dependency direction is strictly one-way — packages never import from apps.

```text
apps/website  ──┐
apps/admin    ──┼──► @repo/ui
                │
apps/website  ──┤
apps/admin    ──┼──► @repo/validation ◄── apps/backend
                │
apps/website  ──┤
apps/admin    ──┴──► @repo/graphql
                      (generated from apps/backend/src/schema.gql)

apps/admin    ──────► @repo/rest-api-client  (planned — auth + upload REST services)

All apps + packages ──► @repo/typescript-config
All apps + packages ──► @repo/eslint-config
apps/website + admin ─► @repo/tailwind-config
```

### Build Order

Turborepo enforces the correct build order via `dependsOn: ["^build"]`:

1. `@repo/typescript-config` — no build step (JSON files consumed directly)
2. `@repo/validation` — compiled to `dist/` (ESM) and `dist-cjs/` (CJS)
3. `@repo/ui` — compiled with `tsc` and Tailwind CLI
4. `@repo/graphql` — codegen + compiled TypeScript
5. `apps/backend`, `apps/admin`, `apps/website` — parallel builds

---

## Authentication Architecture

### Token Lifecycle

```text
Login (GraphQL mutation)
    │
    ├── Access Token (JWT, 15min)  ── returned in response body
    └── Refresh Token (JWT, 7d)   ── set as HttpOnly cookie
                                      (inaccessible to client JavaScript)

Subsequent Requests (Admin Panel)
    │
    ▼  middleware.ts
    ├── accessToken cookie present + valid
    │       → attach to Authorization header → continue to page
    ├── accessToken missing/expired + refreshToken cookie present
    │       → call refreshToken mutation (server-to-server, S2S)
    │       → issue new accessToken cookie (15min)
    │       → issue new refreshToken cookie (7d, sliding window)
    │       → inject Authorization + x-auth-user headers
    └── no valid tokens → redirect to /login

Logout
    └── backend invalidates refreshToken in DB + clears cookies
```

### Login Security Layers

Every login request passes through six independent security gates:

```text
POST /graphql { login(input) }
    │
    ├── 1. Nginx rate limit: 5 req/min per IP (no burst)
    ├── 2. NestJS Throttler: 5 req/min per IP (@Throttle override)
    ├── 3. reCAPTCHA v3: server-side score verification (threshold: 0.5)
    ├── 4. Account lockout: blocks after MAX_LOGIN_ATTEMPTS consecutive failures
    ├── 5. bcrypt: constant-time password verification
    └── 6. LoginAttempt recorded: IP, User-Agent, CAPTCHA score (audit log)
```

---

## GraphQL Schema Synchronization

The `@repo/graphql` package generates TypeScript types from the backend schema. Keeping these synchronized is enforced at two levels:

### 1. Pre-Push Hook (Husky)

Before any commit reaches the remote, the pre-push hook runs:

```bash
pnpm graphql:codegen   # regenerate types from apps/backend/src/schema.gql
turbo run check-types  # typecheck all apps and packages
turbo run lint         # lint all apps and packages
```

If a query references a field that no longer exists in the schema, `check-types` fails and the push is blocked.

### 2. Schema Sync Script

`scripts/check-schema-sync.js` detects when backend GraphQL-related files (resolvers, DTOs, entities) are staged without a corresponding update to `apps/backend/src/schema.gql`:

```text
Stage resolver change (schema.gql not updated)
    │
    ▼
check-schema-sync.js
    └── BLOCKED: run pnpm schema:generate and stage schema.gql
```

This prevents stale schema artifacts from reaching Docker builds or code generation.

---

## Shared Validation Pipeline

Validation logic is defined once in `@repo/validation` (Zod schemas) and consumed across all three applications:

```text
@repo/validation  (Zod schema definitions — single source of truth)
    │
    ├── apps/website  → zodResolver(contactSchema) in React Hook Form
    ├── apps/admin    → zodResolver(loginSchema) + Server Action validation
    └── apps/backend  → nestjs-zod ZodValidationPipe / schema.parse()
```

If a field is renamed or removed, TypeScript compilation fails in all three consumers simultaneously. Contract drift is structurally impossible.

---

## Infrastructure

### Container Architecture

```text
Docker Compose Network: app_network (bridge)

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  nginx   │  │ backend  │  │  admin   │  │ website  │
│  80/443  │  │  :4000   │  │  :3001   │  │  :3000   │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     └──────────────┴─────────────┴──────────────┘
                         app_network

Volumes:
  sqlite_data   → /data/production.db  (persisted across restarts)
  uploads_data  → /app/apps/backend/uploads
```

### Shared Package Build Optimization

A dedicated `package-builder` service (Dockerfile.packages) builds all shared packages once. The resulting image layers are copied into the backend, admin, and website build stages — avoiding redundant builds and reducing total CI time by approximately 75%.

---

## Turborepo Pipeline

```text
pnpm build
    │
    ▼  Turborepo (turbo.json)
    ├── @repo/validation:build
    ├── @repo/ui:build             (after validation)
    ├── @repo/graphql:build        (after ui + validation)
    └── (all packages complete)
         ├── apps/backend:build
         ├── apps/admin:build      (parallel)
         └── apps/website:build    (parallel)
```

Turborepo provides:

- **Remote caching** — unchanged packages are restored from cache, not rebuilt
- **Parallel execution** — independent tasks run simultaneously
- **Dependency-aware ordering** — `dependsOn: ["^build"]` guarantees packages build before consumers
- **Output fingerprinting** — `.next/**`, `dist/**` outputs are hashed for cache correctness
