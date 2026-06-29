# `@repo/validation`

> Part of the monorepo. See the [root README](../../README.md) for workspace architecture, setup, and engineering decisions.

Shared **Zod v4** schemas, validation helpers, and inferred TypeScript types for the monorepo.

`@repo/validation` acts as the workspace’s **shared validation contract layer**, allowing the **Website**, **Admin**, and **Backend** applications to reuse the same input rules and validation logic. This reduces duplication, improves consistency, and helps prevent validation drift across the stack.

---

## Purpose

This package centralizes validation logic that would otherwise be duplicated across applications.

It is used to:

- validate frontend forms
- validate backend request payloads
- share reusable validation helpers across apps
- export inferred TypeScript types from a single source of truth

---

## What's Included

The package currently includes:

- **Authentication schemas** for flows such as login, registration, password reset, and password changes
- **Contact schemas** for shared communication and inquiry forms
- **Security settings schemas** for account and security-related inputs
- **Upload schemas** for file submission workflows
- **File validation helpers** for file type, size, dimensions, and upload constraints
- **Text validation helpers** for reusable string and content rules
- **URL validation helpers** for safe and consistent URL handling

---

## Export Strategy

All public APIs are re-exported from the package entrypoint:

```ts
export * from "./auth.schema";
export * from "./upload.schema";
export * from "./contact.schema";
export * from "./security-settings.schema";
export * from "./file-validation";
export * from "./url-validation";
export * from "./text-validation";
```

Consumers should import from the package root:

```ts
import { loginSchema, type LoginInput } from "@repo/validation";
```

This keeps consumption consistent across all applications and prevents deep-import coupling.

---

## Usage Across the Workspace

This package is consumed by:

- `apps/website` — public-facing forms and user input validation
- `apps/admin` — dashboard and internal management workflows
- `apps/backend` — request payload validation and shared input constraints

Because all three applications reuse the same validation layer, the workspace maintains consistent input rules across UI and API boundaries.

---

## Example Schema

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Please provide a valid email address")
    .min(1, "Email is required")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  captchaToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

This allows consumers to reuse both runtime validation and static typing from the same definition.

---

## Example Consumption

### Frontend

Schemas can be used directly in forms and client-side validation flows, including integrations such as `zodResolver`.

```ts
import { loginSchema, type LoginInput } from "@repo/validation";
```

### Backend

Schemas can be used flexibly in backend validation flows depending on the application’s needs, including:

- parse
- safeParse
- custom validation pipes
- other adapter-based validation patterns
- This keeps the package framework-agnostic while still being fully usable inside NestJS applications.

---

## Validation Helpers

In addition to domain schemas, the package exposes reusable validation utilities.

Examples include:

- allowed MIME type constants
- file size limits
- image and PDF file schemas
- optional file schemas
- multiple file validation
- file extension checks
- image dimension validation helpers

This helps keep validation logic consistent across forms, uploads, and shared workflows without duplicating rules inside applications.

---

## Build

Because this package is compiled before being consumed by other workspace applications, schema or helper changes require a rebuild.

```bash
pnpm --filter @repo/validation build
```

Or rebuild all shared packages:

```bash
pnpm build --filter="./packages/*"
```

Changes become available to consuming applications after the package is rebuilt.

---

## Scope

`@repo/validation` is intentionally limited to shared validation concerns.

### Belongs here

- Zod schemas
- inferred TypeScript types
- reusable validation helpers
- shared input constraints
- validation constants and helper utilities

### Does not belong here

- business logic
- API controllers or route handlers
- GraphQL operations
- Prisma models
- UI state management
- application-specific components

---

## Design Principles

- **Single source of truth:** validation rules are defined once and reused across the workspace
- **Runtime and type safety:** the same definitions provide both runtime validation and inferred TypeScript types
- **Cross-app consistency:** Website, Admin, and Backend rely on the same validation layer
- **Framework flexibility:** schemas can be consumed in different ways without coupling the package to one specific implementation style

---

## Package Metadata

- **Package name:** `@repo/validation`
- **Version:** `1.0.0`
- **Dependency:** `zod@^4.0.14`
- **Outputs:** `dist/` and `dist-cjs/`
- **Module support:** ESM and CommonJS
