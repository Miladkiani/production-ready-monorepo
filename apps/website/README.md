> Part of the **Production-Ready Monorepo Architecture**.
> See the [root README](../../README.md) for workspace overview, setup, and architecture decisions.

# `apps/website`

The public-facing Next.js 15 application.
Built for performance, accessibility, and discoverability — with a full SEO suite, CSP security middleware, ISR data fetching, and PWA support.

---

## Overview

`apps/website` is the user-facing frontend of the monorepo. It serves as a production-grade reference for modern Next.js 15 App Router patterns, including:

- **Security-first middleware** with nonce-based Content Security Policy (CSP)
- **Dual-client data fetching** for optimized SSR and interactive client forms
- **Complete SEO infrastructure** using the Next.js Metadata API
- **Accessibility compliance** with WCAG 2.1 AA standards
- **Dark mode support** powered by `@repo/ui`'s theming system
- **PWA-ready** with a Web App Manifest and maskable icons

---

## Key Architecture Decisions

### 1. Dual-Client GraphQL Strategy

The website uses two separate GraphQL clients depending on context:

| Client | File | When Used |
| --- | --- | --- |
| **Server** | `src/lib/graphql-server.ts` | Server Components, ISR data fetching |
| **Client** | `src/lib/graphql-client.ts` | Interactive mutations (e.g. contact form) |

The **server client** prioritizes `GRAPHQL_INTERNAL_URL` to communicate directly with the backend over the internal Docker network, bypassing Nginx and public DNS. This reduces TTFB during SSR.

The **client** falls back to `NEXT_PUBLIC_GRAPHQL_URL` (the public Nginx-proxied endpoint) for browser-initiated requests.

### 2. Incremental Static Regeneration (ISR)

Pages use `revalidate = 30` and `dynamic = "force-dynamic"` to:

- Skip static generation at build time (Docker builds succeed without a live backend)
- Serve pages on-demand with a 30-second background revalidation window
- Deliver fresh content without full page rebuilds

### 3. Content Security Policy (CSP)

`src/middleware.ts` generates a **unique nonce per request** and injects a strict CSP header in production:

- `script-src` uses `'nonce-{random}'` combined with `'strict-dynamic'` to prevent XSS injection
- `'unsafe-eval'` and `'unsafe-inline'` are excluded from production script sources
- Additional security headers are set: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- In development, CSP is relaxed to allow Next.js hot reloading

### 4. Theme Flash Prevention

A blocking inline script in `layout.tsx` runs before React hydration to read `localStorage` and apply the correct class on `<html>`. This prevents a visible flash of the wrong theme on first paint.

---

## Application Structure

```text
apps/website/
└── src/
    ├── app/
    │   ├── layout.tsx          # Root layout: ThemeProvider, Header, Footer, skip link
    │   ├── page.tsx            # Home page with dynamic contact section
    │   ├── global.css          # Global styles and CSS variable overrides
    │   ├── manifest.ts         # PWA manifest (name, icons, theme color)
    │   ├── robots.ts           # robots.txt generation
    │   └── sitemap.ts          # XML sitemap generation
    ├── components/
    │   ├── home/               # Page-level content sections (Contact, Footer)
    │   ├── layout/             # Header, AnimatedSection, BackToTop, ScrollProgressBar
    │   ├── shared/             # Cross-page reusable components
    │   └── skeleton/           # Loading skeletons for Suspense boundaries
    ├── hooks/                  # App-specific React hooks
    ├── lib/
    │   ├── graphql-server.ts   # Server-only GraphQL client (Docker-internal URL)
    │   ├── graphql-client.ts   # Browser GraphQL client (public URL)
    │   ├── image-url.ts        # Utility to resolve backend image URLs
    │   ├── blur-placeholder.ts # Base64 blur placeholders for next/image
    │   └── csp.ts              # CSP nonce access utilities
    ├── middleware.ts            # CSP nonce generation + security headers
    └── types/                  # App-level TypeScript declarations
```

---

## SEO & Discoverability

The website implements a complete SEO suite using the Next.js Metadata API:

| Feature | Implementation |
| --- | --- |
| **Dynamic Metadata** | `export const metadata` in `layout.tsx` and per `page.tsx` |
| **OpenGraph tags** | Title, description, image, locale, site name |
| **Twitter Card** | `summary` card with image |
| **Canonical URL** | `alternates.canonical` per page |
| **Sitemap** | `src/app/sitemap.ts` — server-generated XML |
| **Robots.txt** | `src/app/robots.ts` — blocks API, internal, and stale metadata routes |
| **PWA Manifest** | `src/app/manifest.ts` — standalone display, theme color, maskable icons |
| **Favicon suite** | 16x16 through 512x512 PNGs + Apple touch icon + SVG mask icon |

---

## Accessibility

The layout meets **WCAG 2.1 AA** standards:

- A **skip-to-content** link is rendered as the first element for keyboard and screen-reader users
- Semantic HTML landmarks (`<header>`, `<main>`, `<footer>`) are used throughout
- `role="main"` and `id="main-content"` are set on the main content wrapper
- `suppressHydrationWarning` on `<html>` prevents hydration errors from theme divergence

---

## Dark Mode

Dark mode is provided by `@repo/ui`'s `ThemeProvider` which wraps the root layout:

- Reads saved preference from `localStorage` on mount
- Falls back to `window.matchMedia('(prefers-color-scheme: dark)')` when no preference exists
- Synchronizes theme changes across browser tabs via the `storage` event
- Applies a CSS class (`dark`) on `<html>` for Tailwind's class-based dark mode

---

## Internal Package Dependencies

| Package | Usage in this app |
| --- | --- |
| `@repo/ui` | `ThemeProvider`, layout primitives, `cn`, icon utilities |
| `@repo/validation` | Contact form Zod schema and inferred TypeScript types |
| `@repo/graphql` | Typed GraphQL document nodes for all operations |

---

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public canonical base URL (e.g. `https://yourdomain.com`) |
| `NEXT_PUBLIC_API_URL` | Yes | Public backend URL for client-side requests |
| `NEXT_PUBLIC_GRAPHQL_URL` | Yes | Public GraphQL endpoint |
| `GRAPHQL_INTERNAL_URL` | Production | Internal Docker URL for server-side queries |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | Production | Comma-separated domains allowed by `next/image` |

Copy the example file to get started:

```bash
cp apps/website/.env.example apps/website/.env
```

---

## Local Development

```bash
# From the monorepo root (starts all services together)
pnpm dev

# Run only the website (packages must be built first)
pnpm --filter website dev
```

The website runs on **http://localhost:3000** in development.
Turbopack is enabled by default (`next dev --turbopack`) for fast hot module replacement.

---

## Production Build

```bash
# Build the website with its workspace dependencies resolved
pnpm build --filter=website

# Build everything in the correct dependency order
pnpm build
```
