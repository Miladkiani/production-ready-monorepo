> Part of the **Production-Ready Monorepo Architecture**.
> See the [root README](../../README.md) for workspace overview, setup, and architecture decisions.

# `apps/admin`

The internal management dashboard for the monorepo.
A Next.js 15 application with middleware-driven JWT authentication, role-based access control, and a full-featured content management interface.

---

## Overview

`apps/admin` is the back-office application. It is protected by a JWT-based authentication system where token refresh is handled entirely in middleware — no client-side token management is needed on first load. The dashboard currently provides:

- **Contact message management** — view, filter by status, and manage inbox messages
- **Security settings** — configure Telegram bot notifications for login events
- **Dashboard overview** — activity summary with quick navigation links

The admin panel is designed to share the same design system and validation layer as the public website, ensuring consistency and zero duplication of business logic.

---

## Key Architecture Decisions

### 1. Middleware-Driven Authentication

Authentication in `apps/admin` is handled at the edge in `src/middleware.ts`. Before any page renders:

1. The middleware reads the `accessToken` cookie
2. If the token is expired or within a 5-minute buffer window, it silently calls the backend's `refreshToken` mutation
3. The refreshed access token and decoded user object are injected into **request headers** (`Authorization`, `x-auth-user`)
4. Server Components read these headers via `headers()` — no client-side token fetch is needed on the initial render

This approach eliminates the "loading spinner on first paint" pattern common in client-side auth flows. Auth state is available immediately in Server Components.

### 2. Header-Seeded AuthProvider

The root layout reads the `Authorization` and `x-auth-user` headers set by middleware and passes them as props into `AuthProvider`:

```tsx
// layout.tsx (Server Component)
const accessToken = authHeader?.replace("Bearer ", "") || null;
const user = JSON.parse(userHeader);

return <AuthProvider initialToken={accessToken} initialUser={user}>...</AuthProvider>;
```

This avoids a client-side `/api/auth/token` round-trip on every page load. The React context is pre-initialized with server-resolved auth state.

### 3. Dual-Client GraphQL Strategy

Like the website, the admin uses two GraphQL clients:

| Client | File | When Used |
| --- | --- | --- |
| **Server** | `src/lib/clients/graphql-server.ts` | Server Components, Server Actions |
| **Client** | `src/lib/clients/graphql-client.ts` | Client Components, mutations with auth context |

The server client reads the access token from the `Authorization` header (set by middleware) and uses `GRAPHQL_INTERNAL_URL` for direct container-to-container communication in production.

The server client also applies intelligent cache strategies per query type:

- List queries: 60-second revalidation
- Detail queries: 5-minute revalidation
- Profile/auth queries: `no-store` (always fresh)

### 4. Route Group Architecture

The application uses Next.js route groups to separate authentication flow from protected content:

```text
src/app/
├── (auth)/          # Unauthenticated routes
│   ├── layout.tsx   # Minimal layout (no sidebar)
│   └── login/       # Login page with reCAPTCHA v3
└── (dashboard)/     # Protected routes (wrapped by AuthGuard)
    ├── layout.tsx   # Full dashboard layout (sidebar, header, breadcrumbs)
    ├── page.tsx     # Overview dashboard
    ├── contact/     # Contact message management
    └── security-settings-actions.ts  # Server Actions for settings
```

`AuthGuard` is a client component that reads from `AuthContext` and redirects unauthenticated users to `/login`.

---

## Application Structure

```text
apps/admin/
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   ├── layout.tsx              # Auth-only layout
    │   │   └── login/page.tsx          # Login form with reCAPTCHA v3
    │   └── (dashboard)/
    │       ├── layout.tsx              # Dashboard shell (sidebar, header, breadcrumbs)
    │       ├── page.tsx                # Dashboard overview / stats
    │       ├── contact/                # Contact message management
    │       │   ├── page.tsx
    │       │   ├── contact-actions.ts  # Server Actions for contact queries
    │       │   └── components/         # ContactPageHeader, ContactMessageTable
    │       └── security-settings-actions.ts  # Server Actions for settings
    ├── components/
    │   ├── auth-guard.tsx              # Client-side auth redirect guard
    │   ├── layout/                     # SidebarNavServer, MobileSidebar, ProfileMenu, HeaderBreadcrumb
    │   ├── common/                     # Shared internal components
    │   └── SecuritySettingsModal.tsx   # Telegram settings form modal
    ├── constants/                      # Navigation routes, labels
    ├── lib/
    │   ├── auth/
    │   │   ├── auth-context.tsx        # AuthProvider + useAuth hook
    │   │   ├── auth-redirect.ts        # Redirect helpers
    │   │   └── captcha-provider.tsx    # GoogleReCaptchaProvider wrapper
    │   ├── clients/
    │   │   ├── graphql-server.ts       # Server-only client (internal Docker URL)
    │   │   ├── graphql-client.ts       # Browser client (public URL)
    │   │   └── upload-client.ts        # File upload REST client
    │   ├── contexts/
    │   │   └── security-settings-context.tsx  # SecuritySettingsProvider
    │   ├── config/                     # App configuration constants
    │   ├── csp-nonce.ts                # CSP nonce access
    │   └── image-url.ts                # Backend image URL resolver
    └── middleware.ts                   # JWT refresh + auth header injection
```

---

## Authentication Flow

```text
Browser Request
     │
     ▼
middleware.ts
     ├── Read accessToken cookie
     ├── Is token valid & not near expiry?
     │    └── YES → inject into request headers → continue
     ├── Is refreshToken cookie present?
     │    └── YES → call backend refreshToken mutation
     │              └── success → set new cookies + inject into headers
     │              └── fail    → clear cookies → redirect to /login
     └── No tokens → redirect to /login (for protected routes)
                                │
                                ▼
                    RootLayout (Server Component)
                         reads headers()
                         passes token + user to AuthProvider
                                │
                                ▼
                    AuthProvider (Client Component)
                         pre-initialized (no /api round-trip)
```

---

## Features

### Contact Message Management

The `/contact` page provides a full inbox interface for messages submitted via the website contact form:

- Fetches messages and statistics server-side (ISR)
- Displays message count by status: `NEW`, `READ`, `REPLIED`, `ARCHIVED`, `SPAM`
- Uses `@repo/graphql` typed document nodes for all queries
- Server Actions handle mutations with automatic `revalidatePath()` cache invalidation

### Security Settings

The `SecuritySettingsModal` allows administrators to configure Telegram bot notifications:

- Telegram Bot Token + Chat ID for login event alerts
- Settings are validated with `UpdateSecuritySettingsSchema` from `@repo/validation` before submission
- Persisted via a GraphQL mutation through a Server Action

### Login with reCAPTCHA v3

The login page integrates Google reCAPTCHA v3:

- `captchaToken` is generated client-side before form submission
- Passed to the backend `login` mutation for server-side score verification
- Backend gracefully degrades if the CAPTCHA service is unavailable

---

## Internal Package Dependencies

| Package | Usage in this app |
| --- | --- |
| `@repo/ui` | All UI primitives, `ThemeProvider`, `ThemeToggle`, `toast`, form components |
| `@repo/validation` | Login schema, security settings schema, inferred TypeScript types |
| `@repo/graphql` | All typed document nodes (`LoginDocument`, `SecuritySettingsDocument`, etc.) |

---

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_GRAPHQL_URL` | Yes | Public GraphQL endpoint for browser requests |
| `GRAPHQL_INTERNAL_URL` | Production | Internal Docker URL for server-side queries |
| `API_URL` | Yes | Backend API base URL (used by middleware for token refresh) |
| `NEXT_PUBLIC_ADMIN_PATH` | Production | Base path prefix (e.g. `/admin`) for Nginx subpath routing |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Yes | Google reCAPTCHA v3 site key |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | Production | Comma-separated domains allowed by `next/image` |
| `COOKIE_DOMAIN` | Production | Cookie domain scope (e.g. `.yourdomain.com`) |

Copy the example file to get started:

```bash
cp apps/admin/.env.example apps/admin/.env
```

---

## Local Development

```bash
# From the monorepo root (starts all services together)
pnpm dev

# Run only the admin app (packages must be built first)
pnpm --filter admin dev
```

The admin panel runs on **http://localhost:3001** in development.

> **Note:** The admin serves at the root path (`/`) in development. In production it runs under the `/admin` subpath via Nginx. This is configured via `NEXT_PUBLIC_ADMIN_PATH`.

---

## Production Build

```bash
# Build the admin app with its workspace dependencies
pnpm build --filter=admin

# Analyze the production bundle
pnpm --filter admin analyze
```
