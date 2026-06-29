# 🏗️ Production-Ready Monorepo Architecture

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black)](https://nextjs.org/) [![NestJS 11](https://img.shields.io/badge/Backend-NestJS%2011-red)](https://nestjs.com/) [![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-blue)](https://turbo.build/) [![pnpm](https://img.shields.io/badge/Package_Manager-pnpm-yellow)](https://pnpm.io/)

A high-performance, type-safe full-stack platform built with **Next.js 15 (App Router)**, **NestJS 11**, and **Turborepo**.

This repository serves as a technical showcase for modern engineering standards: **End-to-end type safety**, **automated schema synchronization**, and **shared governance across the workspace**.

---

## 🧠 Strategic Engineering Decisions

### 1. Unified Validation & Contract Safety

To prevent "Contract Drift" between the API and Frontend, this architecture uses a shared `@repo/validation` package.

- **Zod schemas** are defined once and consumed by **NestJS DTOs** (backend) and **React Hook Form** (frontend).
- If validation contracts change, TypeScript and schema validation help surface mismatches during development and CI.
- A custom check-schema-sync.js script helps ensure the GraphQL schema and generated client types remain synchronized.

### 2. Optimized Data Fetching (Dual-Client Pattern)

Many SSR architectures introduce unnecessary network overhead. This architecture implements a dual-client strategy:

- **Server-to-Server:** During Server-Side Rendering, Next.js communicates with the NestJS API via an **internal Docker network**. This bypasses public DNS and SSL termination, reducing TTFB (Time to First Byte).
- **Client-to-Server:** Apollo Client is used for interactive client-side mutations and state management via the public Nginx reverse proxy.

### 3. Developer Experience (DX) & Governance

- **Turborepo Pipeline:** Optimized build tasks with remote caching and parallel execution.
- **Git Hooks:** `Husky` enforces `pre-push` checks, running `graphql:codegen`, `lint`, and `typecheck` to ensure zero broken code reaches the main branch.
- **Automated Workflows:** Shared ESLint and TypeScript configurations ensure a consistent coding style across all apps and packages.

### 4. Production-Grade Standards: Security, Accessibility & SEO

- **Security:** CSP (Content Security Policy) headers are configured via Next.js to mitigate XSS and data injection attacks.
- **Accessibility:** The `@repo/ui` library is built with semantic HTML and ARIA standards, ensuring WCAG 2.1 AA compliance across all applications.
- **SEO & Discoverability:** Apps leverage the Next.js Metadata API to generate dynamic OpenGraph tags, and sitemaps for optimal search engine ranking.

---

## 📱 Applications

The workspace is divided into specialized applications that consume the shared internal packages:

### 🌐 `apps/website` (The Public Frontend)

- **Tech:** Next.js 15 (App Router).
- **Focus:** SEO optimization, high performance (Core Web Vitals), fully responsive user experience, and dark mode support.
- **Security & SEO:** Implements **Content Security Policy (CSP)** for robust defense and a complete SEO suite (OpenGraph, Sitemap).
- **Accessibility:** Fully accessible interface with keyboard navigation and screen reader support (WCAG 2.1 compliance).
- **Data:** Utilizes the `@repo/graphql` client for optimized Server-Side Rendering (SSR).

### ⚙️ `apps/admin` (Management Dashboard)

- **Tech:** Next.js 15.
- **Focus:** Data-heavy management interfaces, complex form handling, role-based access, fully responsive layouts, and dark mode support.
- **Governance:** Uses the same `@repo/ui` design system to ensure internal tools have the same quality as the public site.

### 🔌 `apps/backend` (The Core API)

- **Tech:** NestJS 11.
- **Database**: SQLite with Prisma ORM.
- **Focus:** Modular service architecture and GraphQL API delivery.
- **Security:** Implements centralized validation via `@repo/validation` to ensure API integrity.

---

## 📦 Internal Packages & Design System

The monorepo architecture centers around a high-performance, shared ecosystem. This ensures that the **Website** and **Admin** dashboard maintain a unified look and feel while sharing core UI primitives, validation contracts, and API client logic.

### 🎨 [`@repo/ui`](./packages/ui/README.md)

- **Shared component library:** Reusable React UI components, hooks, and styling utilities for the workspace.
- **Tailwind-first:** Built around utility-first styling, composable components, and internal design consistency.
- **Flexible exports:** Lightweight primitives are exported from the root, while larger modules use path-based imports.

### 🛡️ [`@repo/validation`](./packages/validation/README.md)

- **Shared validation layer:** Centralized Zod schemas reused across the frontend and backend.
- **Runtime + type safety:** Validation rules and inferred TypeScript types come from the same source of truth.
- **Cross-app consistency:** Shared input rules stay aligned across applications in the workspace.

### 🔗 [`@repo/graphql`](./packages/graphql/README.md)

- **Shared GraphQL contract:** Centralized operation documents, generated TypeScript types, and typed document nodes.
- **Schema-driven generation:** Client artifacts are generated from the backend GraphQL schema.
- **Reusable across apps:** Frontend applications can consume strongly typed GraphQL operations from a single package.

### ⚙️ Shared Configuration Workspace

To maintain high code quality and consistency, we centralize our tooling:

- **`@repo/tailwind-config`**: A single source of truth for design tokens (colors, spacing, typography) using Tailwind v4's CSS-first engine.
- **`@repo/eslint-config`**: Shared linting rules (including Prettier integration) to enforce clean code standards.
- **`@repo/typescript-config`**: Strict, shared `tsconfig.json` bases to ensure type-safety consistency across all apps and packages.

---

## 📚 Documentation

### Application READMEs

- [`apps/website`](./apps/website/README.md) — CSP middleware, dual-client SSR, SEO suite, ISR, PWA
- [`apps/admin`](./apps/admin/README.md) — middleware-driven JWT auth, route groups, contact management
- [`apps/backend`](./apps/backend/README.md) — NestJS modules, security architecture, Prisma schema, API endpoints

### Package READMEs

- [`@repo/ui`](./packages/ui/README.md) — shared UI components, hooks, and styling utilities
- [`@repo/validation`](./packages/validation/README.md) — shared Zod schemas, inferred types, and validation helpers
- [`@repo/graphql`](./packages/graphql/README.md) — shared GraphQL operations, generated types, and typed document nodes

### Engineering Docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system overview, request flows, package dependency graph, auth flow, Turborepo pipeline
- [`DEVELOPMENT.md`](./DEVELOPMENT.md) — full local setup, env vars, database management, GraphQL workflow, debugging
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — branch naming, commit conventions, pre-push hooks, PR process, code style

---

## 📂 Project Structure

A high-level overview of the monorepo organization:

```text
├── apps/
│   ├── website/      # Next.js 15: Public-facing, SEO-optimized application.
│   ├── admin/        # Next.js 15: Internal management dashboard.
│   └── backend/      # NestJS 11: GraphQL API layer with Prisma/SQLite.
├── packages/
│   ├── ui/           # Shared Tailwind v4 Design System & components.
│   ├── validation/   # Centralized Zod schemas for E2E type safety.
│   ├── graphql/      # GraphQL fragments, operations, and generated types.
│   ├── tailwind-config/ # Shared Tailwind v4 design tokens.
│   ├── eslint-config/   # Unified linting and code style governance.
│   └── typescript-config/ # Standardized TS configurations.
└── /           # Nginx and infrastructure configurations.
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** >= 20.0.0
- **pnpm:** >= 9.0.0
- **Docker:** For production environment simulation and Nginx reverse proxy.

### Environment Setup

Each application and package contains a .env.example file. To get started quickly, you can run the following to initialize your local environment:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/website/.env.example apps/website/.env
cp apps/admin/.env.example apps/admin/.env
```

### Local Development

```bash
# Install dependencies
pnpm install

# Build all internal packages (including @repo/validation)
pnpm build --filter="./packages/*"

# Initialize Database (Prisma + SQLite)
pnpm prisma:setup

# Start all services in dev mode
pnpm dev
```

## 🏗️ Production Build & Deployment

### Production Build

Our CI/CD pipeline leverages Turborepo’s remote caching and pruning capabilities to create optimized Docker images for each service.

```bash
# Build a specific app (e.g., website) with its dependencies
pnpm build --filter=website

# Build everything (packages + all apps)
pnpm build

# Spin up the infrastructure (Nginx, App)
docker-compose up --build -d

# View logs
docker-compose logs -f
```

## CI/CD Integration

Our pipelines are designed to fail fast. We utilize pre-push hooks and CI checks:

- **Type Checking:** `pnpm check:types`
- **Linting:** `pnpm check:lint`
- **Schema Validation:** `pnpm check:schema`
- **GraphQL Codegen:** `pnpm graphql:codegen`

## 🗺️ Roadmap

Future enhancements planned for this starter kit:

- [ ] **E2E Testing Suite:** Integration of Playwright for cross-browser testing.
- [ ] **AI Integration:** A dedicated `@repo/ai` package for standardized LLM interactions (OpenAI/LangChain).
- [ ] **Observability:** Integration with OpenTelemetry and Sentry for production monitoring.
- [ ] **@repo/rest-api-client** Planned typed client for REST endpoints such as file uploads and auth flows.

## 👤 Author

**Milad Kianifard**

- [Portfolio Website](https://miladkiani.com)
- [LinkedIn](https://linkedin.com/in/milad-kianifard)
- [ADPList Mentorship](https://adplist.org/mentors/milad-kianifard)

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
