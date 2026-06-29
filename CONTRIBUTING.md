# Contributing

Thank you for your interest in contributing to this project.  
This document covers how to set up your environment, the conventions we follow, and the process for submitting changes.

---

## Prerequisites

Before contributing, make sure you have the following installed:

| Tool        | Version   | Notes                                                                                               |
| ----------- | --------- | --------------------------------------------------------------------------------------------------- |
| **Node.js** | >= 20.0.0 | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage versions |
| **pnpm**    | >= 9.0.0  | Install with `npm install -g pnpm`                                                                  |
| **Docker**  | Latest    | Required for running the full stack                                                                 |
| **Git**     | Latest    | Git hooks are enabled via Husky                                                                     |

---

## Getting Started

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/your-username/production-ready-monorepo.git
cd production-ready-monorepo

# 2. Install dependencies
pnpm install

# 3. Build all shared packages (required before running apps)
pnpm build:packages

# 4. Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/website/.env.example apps/website/.env
cp apps/admin/.env.example apps/admin/.env

# 5. Set up the database
pnpm prisma:setup

# 6. Start all services in development mode
pnpm dev
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for a detailed walkthrough of the local environment.

---

## Branch Naming

| Type          | Pattern                      | Example                       |
| ------------- | ---------------------------- | ----------------------------- |
| Feature       | `feat/short-description`     | `feat/telegram-notifications` |
| Bug fix       | `fix/short-description`      | `fix/token-refresh-loop`      |
| Documentation | `docs/short-description`     | `docs/architecture-update`    |
| Refactor      | `refactor/short-description` | `refactor/graphql-client`     |
| Chore         | `chore/short-description`    | `chore/upgrade-nestjs-11`     |

```bash
git checkout -b feat/your-feature-name
```

---

## Commit Messages

We use the [Conventional Commits](https://www.conventionalcommits.org/) format.

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

### Types

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation changes only                              |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                                |
| `chore`    | Build process, dependency updates, tooling changes      |
| `perf`     | Performance improvements                                |

### Scope

Use the app or package name as scope:

- `feat(admin): add contact message export`
- `fix(backend): handle refresh token race condition`
- `docs(ui): update export strategy section`
- `chore(deps): upgrade zod to v4`

### Rules

- Use the imperative present tense: "add feature", not "added feature"
- Do not capitalize the first letter of the summary
- Do not end the summary with a period
- Keep the summary under 72 characters

---

## Pre-Push Hooks

This repository uses [Husky](https://typicode.github.io/husky/) to enforce quality gates before code reaches the remote. The `pre-push` hook automatically runs:

```bash
pnpm graphql:codegen    # regenerate @repo/graphql types from backend schema
turbo run check-types   # typecheck all apps and packages
turbo run lint          # lint all apps and packages
```

**Your push will be blocked if any of these steps fail.** This is intentional — it prevents broken code from reaching the main branch.

If you need to bypass a hook in exceptional circumstances:

```bash
git push --no-verify
```

Use this sparingly. Never push code that fails type checking to a shared branch.

---

## Code Style

### TypeScript

- **Strict mode is enforced** across all apps and packages via `@repo/typescript-config`
- Prefer explicit types over `any`
- Use `type` imports where possible: `import type { Foo } from '...'`
- Avoid barrel re-exports unless they belong in a package's public API (`index.ts`)

### React / Next.js

- Prefer **Server Components** by default; use `"use client"` only when necessary
- Co-locate component logic, hooks, and styles in the component directory
- Use `@repo/ui` primitives before writing new UI components
- Use `@repo/validation` schemas for all form validation

### NestJS

- Each feature module owns its resolver, service, entities, and DTOs
- Use `@nestjs/config` with `getOrThrow` for required environment variables
- Use Zod via `nestjs-zod` for DTO validation where applicable
- Guard protected mutations and queries with `@UseGuards(JwtAuthGuard)`

### ESLint

All apps and packages share a common ESLint configuration from `@repo/eslint-config`. Run the linter before committing:

```bash
pnpm check:lint
```

---

## Running Checks Locally Before Pushing

The pre-push hook will block your push if type checking or linting fails. Run this before pushing to catch issues early and avoid a surprise block:

```bash
# Type check + lint across all apps and packages
pnpm check:all

# Or run them separately
pnpm check:types
pnpm check:lint

# Regenerate GraphQL types if you touched backend schema or queries
pnpm graphql:codegen
```

> The full pre-push sequence is: `pnpm graphql:codegen && turbo run check-types lint`. Running `pnpm check:all` locally covers the type check and lint steps.

---

## Adding a New Shared Package

1. Create the package directory under `packages/`
2. Add a `package.json` with `"name": "@repo/your-package"`
3. Reference it in other packages or apps as `"@repo/your-package": "workspace:*"`
4. Add the package to the `pnpm-workspace.yaml` if needed
5. Rebuild the workspace: `pnpm install && pnpm build:packages`

If the package needs to be built before being consumed, add a `"build"` script and verify Turborepo's pipeline picks it up correctly.

---

## Adding a New App

1. Create the app directory under `apps/`
2. Add a `package.json` with a unique `"name"`
3. Extend the appropriate `@repo/typescript-config` base in `tsconfig.json`
4. Add the app's ESLint config extending `@repo/eslint-config`
5. If the app uses Tailwind, import `@repo/tailwind-config`
6. Add `dev`, `build`, `lint`, and `type-check` scripts to `package.json`
7. Run `pnpm install` to register the new workspace member

---

## Pull Request Process

This repository started from a single initial commit. There is no existing issue backlog — feel free to open issues for bugs, ideas, or questions.

1. **Update relevant documentation** — if your change affects behavior described in a README or `ARCHITECTURE.md`, update those files in the same PR
2. **Keep PRs focused** — one logical change per PR makes reviews faster
3. **Describe your changes** — explain _why_, not just _what_, in the PR description
4. **Reference an issue if one exists** — use `Closes #123` in the PR body if your work addresses an open issue; otherwise a clear description is enough
5. **Ensure checks pass** — run `pnpm check:all` locally before opening the PR; all type checks and linting must pass

---

## Reporting Issues

When filing a bug report, please include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Environment details (OS, Node version, pnpm version)
- Relevant logs or error messages
