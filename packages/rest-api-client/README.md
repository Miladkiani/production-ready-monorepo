> Part of the **Production-Ready Monorepo Architecture**.  
> See the [root README](../../README.md) for workspace overview, setup, and architecture decisions.

# `@repo/rest-api-client`

> ⚠️ **Status: Planned — not yet implemented.**  
> This package is a documented placeholder. The source has not been written yet. See [Current Status](#current-status) for context.

A planned typed REST API client for the monorepo, providing a unified service layer for all backend REST endpoints.

---

## Current Status

The package currently has no `src/` and no compiled `dist/`. It is **not consumable** by apps today.

The backend primarily exposes a **GraphQL API**, consumed via [`@repo/graphql`](../graphql/README.md). Two REST endpoints do exist today:

| Endpoint                                            | Module        | Currently consumed by                                       |
| --------------------------------------------------- | ------------- | ----------------------------------------------------------- |
| `POST /api/upload`                                  | `FilesModule` | `apps/admin` via its own `src/lib/clients/upload-client.ts` |
| `POST /auth/login`, `/auth/refresh`, `/auth/logout` | `AuthModule`  | `apps/admin` middleware (via GraphQL mutations, not REST)   |

This package becomes the right home when:

- The backend adds more REST endpoints (articles, certificates, skills, etc.)
- An external tool, script, or third-party integration needs a programmatic client
- The admin app's upload client should be consolidated here instead of living in-app

---

## Intended Architecture

When implemented, the package should follow a layered design:

```text
ApiClient  (src/client.ts)
│  single entry point, composes all services, manages a shared token
│
├── AuthService        extends BaseHttpClient
└── UploadService      standalone (multipart/form-data)

BaseHttpClient  (src/core/base-http-client.ts)
│  token management (in-memory + localStorage) + generic fetch wrapper
│
└── ResourceService<TResponse, TCreate, TUpdate>  (src/core/resource-service.ts)
         provides getAll(), getById(), create(), update(), remove()
         extended by future domain services
```

### BaseHttpClient responsibilities

- Store and inject `Authorization: Bearer <token>` on all requests
- Read base URL from `NEXT_PUBLIC_API_URL`
- Expose typed `get()`, `post()`, `put()`, `patch()`, `delete()` helpers
- Throw descriptive errors on non-OK responses

### ResourceService pattern

```ts
abstract class ResourceService<
  TResponse,
  TCreate,
  TUpdate,
> extends BaseHttpClient {
  protected abstract readonly basePath: string;

  getAll(queryParams?: Record<string, string>): Promise<TResponse[]>;
  getById(id: string): Promise<TResponse>;
  create(data: TCreate): Promise<TResponse>;
  update(id: string, data: TUpdate): Promise<TResponse>;
  remove(id: string): Promise<TResponse>;
}
```

---

## Services to implement (backed by real endpoints)

Only implement services for endpoints that actually exist on the backend.

| Service         | Backend module | REST path                                      |
| --------------- | -------------- | ---------------------------------------------- |
| `AuthService`   | `AuthModule`   | `/auth/login`, `/auth/refresh`, `/auth/logout` |
| `UploadService` | `FilesModule`  | `POST /api/upload`, `DELETE /api/upload`       |

> Do **not** add services for resources that are only available over GraphQL (profile, contact, security settings, etc.). Use [`@repo/graphql`](../graphql/README.md) for those.

---

## Intended Usage (once implemented)

### Singleton instance

```ts
import { apiClient } from "@repo/rest-api-client";

// Authenticate
const { accessToken } = await apiClient.auth.login(
  "user@example.com",
  "password",
);
apiClient.setToken(accessToken);

// Upload a file
const { url } = await apiClient.upload.uploadAvatar(file);
```

### Import types only

```ts
import type { LoginResponse, UploadResponse } from "@repo/rest-api-client";
```

---

## How to implement

1. Create `src/` with the structure above
2. Add a `tsconfig.json` extending `@repo/typescript-config/base.json`
3. Add `"type": "module"`, `"main"`, `"types"`, and `"exports"` fields to `package.json`
4. Run `pnpm --filter @repo/rest-api-client build` to compile
5. Add `"@repo/rest-api-client": "workspace:*"` to the consuming app's `package.json`

---

## Environment Variables

| Variable              | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL for all REST requests (e.g. `http://localhost:4000`) |

---

## Scope

### Belongs here

- Typed REST service classes (`AuthService`, `UploadService`)
- HTTP client infrastructure (`BaseHttpClient`, `ResourceService`)
- Domain request and response types for REST endpoints
- A singleton `apiClient` instance

### Does not belong here

- GraphQL operations → use [`@repo/graphql`](../graphql/README.md)
- Validation schemas → use [`@repo/validation`](../validation/README.md)
- Application-specific data-fetching logic
- UI components or state management
