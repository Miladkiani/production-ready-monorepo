> Part of the **Production-Ready Monorepo Architecture**.
> See the [root README](../../README.md) for workspace overview, setup, and architecture decisions.

# `apps/backend`

The core API layer for the monorepo.
A NestJS 11 application exposing a code-first GraphQL API backed by Prisma ORM and SQLite, with a multi-layer security architecture built for production.

---

## Overview

`apps/backend` is a NestJS 11 application that acts as the single data source for both the public website and the admin dashboard. It provides:

- A **code-first GraphQL API** with Apollo Server, auto-generating `schema.gql` on startup
- A **REST file upload endpoint** using Multer, with static file serving
- A **multi-layer security system**: JWT access/refresh tokens, account lockout, reCAPTCHA v3, and rate limiting
- **Email notifications** via Nodemailer (configurable SMTP)
- **Telegram login alerts** via the Security Settings module
- **Prisma ORM** with SQLite for zero-dependency local data persistence

---

## Module Architecture

The application is organized into focused NestJS modules, each owning its own resolver, service, and data access logic:

| Module | Responsibility |
| --- | --- |
| AuthModule | Login, logout, token refresh, JWT validation, account lockout, reCAPTCHA |
| FilesModule | File upload (Multer), static file serving, upload management REST API |
| ContactModule | Contact message CRUD, status management, statistics |
| EmailModule | Nodemailer-based transactional email (contact notifications, etc.) |
| SecuritySettingsModule | Telegram bot token + chat ID configuration |
| PrismaModule | Shared Prisma client, exported for use across all modules |

---

## Security Architecture

Security is implemented as a multi-layer defense-in-depth strategy.

### JWT Token Strategy

| Token | Lifetime | Storage | Purpose |
| --- | --- | --- | --- |
| **Access Token** | 15 minutes | Response body / Authorization header | Authorizes GraphQL/REST requests |
| **Refresh Token** | 7 days | HttpOnly cookie | Obtains a new access token silently |

- Refresh tokens are **hashed with bcrypt** before being stored in the database
- The access token is short-lived to minimize exposure if intercepted
- The refresh token cookie uses `HttpOnly`, `Secure`, and configurable `SameSite` flags

### Account Lockout

`AccountLockoutService` tracks failed login attempts in the `LoginAttempt` table:

- After `MAX_LOGIN_ATTEMPTS` (default: 5) consecutive failures, the account is locked
- Lockout duration is configurable via `LOCKOUT_DURATION_MINUTES` (default: 15 minutes)
- Login attempts record IP address, User-Agent, and reCAPTCHA score for audit purposes

### reCAPTCHA v3

`CaptchaService` verifies Google reCAPTCHA v3 tokens server-side:

- Configurable score threshold via `RECAPTCHA_V3_THRESHOLD` (default: 0.5)
- Graceful degradation: if the reCAPTCHA API is unavailable, login is not blocked
- Can be fully disabled in development via `CAPTCHA_ENABLED=false`

### Rate Limiting (Defense in Depth)

Rate limiting is applied at two independent layers.

**Nginx layer** (first line of defense):
- GraphQL: 10 req/s per IP (burst: 20)
- Login: 5 req/min per IP (no burst)

**NestJS layer** (second line of defense via `@nestjs/throttler`):
- Short: 10 req/s per IP
- Medium: 100 req/min per IP
- Long: 1000 req/hour per IP
- Login mutation: overridden to 5 req/min per IP via `@Throttle` decorator

---

## Database Schema

The application uses **Prisma ORM with SQLite**. Key models:

| Model | Purpose |
| --- | --- |
| User | Admin/editor accounts with role-based access (ADMIN, EDITOR) |
| Session | Active user sessions with expiry tracking |
| LoginAttempt | Audit log for all login attempts (used by lockout logic) |
| Profile | Public profile data (name, bio, tagline, contact, social links) |
| Social | Social media links associated with a Profile |
| ContactMessage | Contact form submissions from the website |
| SecuritySettings | Single-record model for Telegram notification config |

The `ContactMessage` model uses a `ContactMessageStatus` enum: `NEW`, `READ`, `REPLIED`, `ARCHIVED`, `SPAM`.

---

## API Endpoints

### GraphQL API

**Endpoint:** POST /graphql
**Playground:** available in development at http://localhost:4000/graphql

The schema is auto-generated from NestJS decorators and written to `src/schema.gql`. Key operations:

| Operation | Type | Description |
| --- | --- | --- |
| login | Mutation | Authenticate and receive access/refresh tokens |
| refreshToken | Mutation | Exchange a refresh token cookie for a new access token |
| logout | Mutation | Invalidate refresh token and clear cookie |
| me | Query | Get the currently authenticated user |
| contactMessages | Query | List contact messages (admin only) |
| createContactMessage | Mutation | Submit a contact message (public) |
| updateContactMessageStatus | Mutation | Update message status (admin only) |
| securitySettings | Query | Fetch current Telegram notification config (admin only) |
| updateSecuritySettings | Mutation | Update Telegram config (admin only) |

### REST API

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| /api/upload | POST | JWT | Upload a file (image, PDF, etc.) |
| /uploads/:filename | GET | Public | Serve an uploaded file |
| /auth/login | POST | None | REST login (for testing/non-GraphQL clients) |
| /auth/refresh | POST | Cookie | REST token refresh |
| /auth/logout | POST | JWT | REST logout |

---

## File Uploads

Uploaded files are stored in the `uploads/` directory (configurable via `UPLOAD_DIR`).
`ServeStaticModule` serves the directory at `/uploads` for direct access.
In production, Nginx proxies `/api/uploads` to the backend container.

---

## Email and Notifications

### Email (Nodemailer)

Configured via SMTP environment variables. Used to send:

- Contact form submission notifications to the admin email
- Can be disabled entirely with `EMAIL_ENABLED=false`

### Telegram

When a Telegram Bot Token and Chat ID are configured via Security Settings, the backend sends a real-time notification on each successful login — useful for detecting unauthorized access.

---

## CORS Configuration

CORS is configured dynamically from environment variables:

- `CORS_ORIGIN` — comma-separated list of allowed origins
- Falls back to `ADMIN_URL` and `FRONTEND_URL` if `CORS_ORIGIN` is not set
- Credentials mode is enabled (required for HttpOnly cookie-based auth)

---

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| DATABASE_URL | Yes | Prisma connection string (e.g. file:./dev.db) |
| JWT_SECRET | Yes | Secret for signing access tokens |
| JWT_REFRESH_SECRET | Yes | Secret for signing refresh tokens |
| CORS_ORIGIN | Yes | Comma-separated allowed CORS origins |
| FRONTEND_URL | Yes | Public website URL |
| ADMIN_URL | Yes | Admin panel URL |
| PORT | No | HTTP port (default: 4000) |
| UPLOAD_DIR | No | File upload directory (default: uploads) |
| MAX_LOGIN_ATTEMPTS | No | Lockout threshold (default: 5) |
| LOCKOUT_DURATION_MINUTES | No | Lockout window in minutes (default: 15) |
| RECAPTCHA_SECRET_KEY | No | Google reCAPTCHA v3 server-side secret |
| CAPTCHA_ENABLED | No | Enable/disable CAPTCHA (default: true) |
| COOKIE_SECURE | No | Secure flag on cookies (default: true) |
| COOKIE_SAME_SITE | No | SameSite cookie policy (default: lax) |
| COOKIE_DOMAIN | No | Cookie domain (e.g. .yourdomain.com) |
| EMAIL_ENABLED | No | Enable email notifications (default: false) |
| SMTP_HOST | No | SMTP server hostname |
| SMTP_PORT | No | SMTP server port (default: 587) |
| SMTP_USER | No | SMTP username |
| SMTP_PASS | No | SMTP password |
| ADMIN_EMAIL | No | Recipient email for contact notifications |

Copy the example file to get started:

```bash
cp apps/backend/.env.example apps/backend/.env
```

---

## Local Development

```bash
# From the monorepo root (starts all services together)
pnpm dev

# Run only the backend in watch mode
pnpm --filter backend dev
```

The backend runs on **http://localhost:4000** in development.
The GraphQL Playground is available at **http://localhost:4000/graphql**.

---

## Database Management

```bash
# Generate Prisma client and apply migrations with seed data
pnpm prisma:setup

# Create a new migration after schema changes
pnpm prisma:migrate

# Reset the database and re-seed
pnpm prisma:reset

# Open Prisma Studio to inspect data
pnpm --filter backend exec prisma studio

# Manage admin user accounts (create, update, delete)
pnpm user:manage
```

---

## GraphQL Schema Generation

The schema is auto-generated from NestJS decorators when the application starts.
To regenerate manually (required before running graphql:codegen):

```bash
pnpm schema:generate
```

---

## Testing

```bash
# Unit tests
pnpm --filter backend test

# End-to-end tests
pnpm --filter backend test:e2e

# Test coverage report
pnpm --filter backend test:cov
```

---

## Production Build

```bash
# Compile the backend
pnpm build --filter=backend

# Start the compiled production server
pnpm --filter backend start
```
