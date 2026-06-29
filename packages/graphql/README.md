> Part of the **Production-Ready Monorepo Architecture**.  
> See the [root README](../../README.md) for workspace overview, setup, and architecture decisions.

# `@repo/graphql`

Shared GraphQL operation documents, generated TypeScript types, and typed document nodes for the workspace.

This package acts as the frontend-facing GraphQL contract layer by generating strongly typed artifacts from the backend schema and exposing reusable operations for consuming apps.

## What this package contains

- GraphQL operation documents under `src/queries`
- Generated TypeScript types and typed document nodes under `src/generated/graphql.ts`
- GraphQL Code Generator configuration in `codegen.ts`
- Package exports for generated artifacts and reusable query documents

---

## Schema source

Code generation uses the backend GraphQL schema as its source of truth.

The codegen configuration resolves the schema in this order:

1. Local schema file: `apps/backend/src/schema.gql`
2. `GRAPHQL_SCHEMA_URL` environment variable
3. Fallback local endpoint: `http://localhost:4000/graphql`

This makes the package work in both local development and Docker/CI environments.

---

## Queries

Shared GraphQL operation documents live in:

```text
src/queries/
```

Current examples include:

- auth.graphql
- contact.graphql
- security-settings.graphql

---

## Generated output

These artifacts are generated from the backend schema and the operation documents in `src/queries`.

Generated GraphQL types and typed document nodes are written to:

```text
src/generated/graphql.ts
```

---

## Usage

Consumers should import from the package's public exports rather than internal source file paths.

### Generated types and typed document nodes

```ts
import {
  LoginDocument,
  type LoginMutation,
  type LoginMutationVariables,
} from "@repo/graphql";
```

---

## Code generation

Run code generation for this package with:

```bash
pnpm --filter @repo/graphql codegen
```

Or from the monorepo root:

```bash
pnpm graphql:codegen
```

Build the package with:

```bash
pnpm --filter @repo/graphql build
```

---

## Schema synchronization check

The repository includes a pre-commit check at:

```text
./scripts/check-schema-sync
```

This hook ensures that when backend GraphQL resolver, entity, model, DTO, input, or related GraphQL files change, the backend schema file is also updated:

```text
apps/backend/src/schema.gql
```

If backend GraphQL-related files are staged without an updated schema, the commit is blocked and you will be asked to run:

```bash
pnpm schema:generate
git add apps/backend/src/schema.gql
```

This helps prevent stale schema artifacts from being used in Docker builds or downstream code generation.

---

## Scope

This package should contain:

- shared GraphQL operation documents
- generated GraphQL types
- typed document nodes
- codegen configuration related to shared GraphQL consumption

This package should not contain:

- backend resolver logic
- business logic
- service-layer code
- application-specific UI data fetching logic

---

## Design principles

- **Schema as source of truth:** Generated client artifacts should follow the backend GraphQL schema.
- **Shared contract:** GraphQL operations and generated types should be reusable across consuming apps.
- **Typed consumption:** Frontend applications should use strongly typed document nodes and operation result types.
- **Build portability:** Code generation should work in local development, Docker, and CI environments.
