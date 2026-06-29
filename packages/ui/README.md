> Part of the **Production-Ready Monorepo Architecture**.  
> See the [root README](../../README.md) for workspace overview, setup, and architecture decisions.

# `@repo/ui`

A shared UI component library for the monorepo, built with React, TypeScript, and Tailwind CSS.  
It provides reusable primitives, feature-level components, utility hooks, and shared styling foundations for applications in the workspace.

---

## Overview

`@repo/ui` is designed to be:

- **Framework-friendly** for React-based apps
- **Tailwind-first** for styling consistency
- **Type-safe** with TypeScript
- **Composable** through raw primitives and custom implementations
- **Tree-shakable** through split exports for lightweight consumption

This package avoids heavy UI abstraction layers and instead focuses on maintainable, production-ready components that can evolve with product needs.

---

## Design Strategy

The library does **not** depend on Radix UI or other headless component systems as a core architectural foundation.

- raw React primitives
- custom component composition
- utility-first styling with Tailwind CSS
- focused abstractions only where they provide real value

This approach keeps the library:

- easier to control
- easier to debug
- less coupled to third-party APIs
- more adaptable to product-specific requirements

---

## Package Structure

The `@repo/ui` package centralizes component code under `packages/ui/src/components/`, while shared utility logic, hooks, and styles remain in dedicated directories.

This structure helps maintain a clear boundary between:

- visual building blocks
- reusable helper functions
- shared React hooks
- styling foundations

```text
packages/ui/
└── src/
    ├── components/
    │   ├── Avatar.tsx
    │   ├── Breadcrumb.tsx
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   ├── CheckBox.tsx
    │   ├── Chip.tsx
    │   ├── ConfirmationModal.tsx
    │   ├── EditableText.tsx
    │   ├── FileUploader.tsx
    │   ├── Icon.tsx
    │   ├── icons.ts
    │   ├── ImageUploader.tsx
    │   ├── Input.tsx
    │   ├── Loading.tsx
    │   ├── Modal.tsx
    │   ├── MultiSelect.tsx
    │   ├── RichTextEditor.tsx
    │   ├── Skeleton.tsx
    │   ├── Textarea.tsx
    │   ├── ThemeProvider.tsx
    │   ├── ThemeToggle.tsx
    │   ├── Toast.tsx
    │   ├── Typography.tsx
    │   ├── drawer/             # Drawer + composition pieces
    │   ├── form/               # Form-aware wrappers (ImageUploaderForm, etc.)
    │   ├── ImageCarouselModal/ # Carousel modal component
    │   └── skeletons/          # Loading skeleton variants
    ├── functions/
    │   ├── cn.ts               # clsx + tailwind-merge utility
    │   └── iconUtils.ts        # lucide-react icon validation helpers
    ├── hooks/
    │   └── useDarkMode.ts      # Theme persistence + system preference sync
    ├── styles.css              # Global styles compiled to dist/index.css
    └── index.ts                # Root re-export entrypoint
```

---

## Component Organization

### Thin components

Simple shared components are exported through the package entrypoint:

```ts
import { Button, Input, Textarea, Card, Modal, Typography } from "@repo/ui";
import {
  Avatar,
  Breadcrumb,
  CheckBox,
  Chip,
  Loading,
  Skeleton,
} from "@repo/ui";
import { Toast, Icon, ThemeProvider, ThemeToggle } from "@repo/ui";
```

These are typically:

- small
- reusable
- dependency-light
- frequently used across apps

This layer also includes shared app-facing primitives such as icons and theme-related components like `ThemeProvider` and `ThemeToggle`.

### Complex components

Larger modules are separated into dedicated folders inside `src/components/` and imported from explicit paths when needed.

```ts
import { Table } from "@repo/ui/components/Table";
import { Drawer } from "@repo/ui/components/Drawer";
import { ImageUploader } from "@repo/ui/components/ImageUploader";
import { FileUploader } from "@repo/ui/components/FileUploader";
import { RichTextEditor } from "@repo/ui/components/RichTextEditor";
import { ImageCarouselModal } from "@repo/ui/components/ImageCarouselModal";
```

This helps:

- reduce unnecessary bundle cost
- keep package boundaries clear
- improve tree-shaking
- avoid forcing all consumers to load every component path through a single barrel export

---

## Directory Philosophy

The structure inside `src/components/` is organized by complexity and ownership.

| Area                             | Purpose                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Flat components in `components/` | Small shared primitives and commonly reused components (Button, Card, Input, Modal, Typography, etc.) |
| `form/`                          | Form-aware wrappers: `ImageUploaderForm`, `FileUploaderForm`, `MultiSelectForm`                       |
| `drawer/`                        | Drawer component and composition pieces                                                               |
| `skeletons/`                     | Loading state skeleton variants                                                                       |
| `ImageCarouselModal/`            | Image carousel modal and interaction logic                                                            |

This layout makes the library easier to scale as new modules are introduced.

---

## Theming

The library supports dark mode through a small theming system built from hooks, shared components, and React context.

### Theme architecture

The theming layer includes:

- `useDarkMode` for managing theme state and persistence
- `ThemeProvider` for exposing theme state through React context
- `useTheme` for consuming theme state inside components
- `ThemeToggle` for switching between light and dark mode from the UI

### Characteristics

- uses `localStorage` to persist user preference
- uses `window.matchMedia('(prefers-color-scheme: dark)')` for system preference detection
- synchronizes theme changes across tabs using the `storage` event
- exposes theme state through context for app-wide usage
- integrates well with CSS variables and Tailwind-based theming

### Example behavior

- if the user has a saved theme, it is respected
- otherwise, the system theme is used
- when theme preference changes in one tab, other tabs update automatically
- any component using `useTheme` can access the current mode and toggle behavior

This provides a lightweight but practical theming strategy without requiring an external state library.

---

## Styling Approach

The package uses **Tailwind CSS** as the primary styling layer.

In addition:

- shared global styles can live in `styles/`
- CSS variables can be used for theme tokens
- dark mode can be driven by a combination of class-based strategy and custom hook logic
- component styles remain close to implementation and easy to refactor

This keeps styling:

- predictable
- reusable
- easy to override at the application layer

---

## Export Strategy

The package uses a **split export strategy** to keep the root entrypoint lean.

### Root-level import

All flat, lightweight components and utilities are available from the root:

```ts
import {
  Button,
  Card,
  Input,
  Textarea,
  Modal,
  Typography,
  Avatar,
  Badge,
  Breadcrumb,
  CheckBox,
  Chip,
  ConfirmationModal,
  EditableText,
  Icon,
  Loading,
  MultiSelect,
  Skeleton,
  Toast,
  ThemeProvider,
  ThemeToggle,
} from "@repo/ui";
```

### Path-based imports

Heavier or more specialized modules use explicit paths to prevent unnecessary bundle cost:

```ts
// Complex layout component
import { Drawer } from "@repo/ui/components/Drawer";

// Heavy table with sorting/filtering logic
import { Table } from "@repo/ui/components/Table";

// File & image upload components (standalone)
import { ImageUploader } from "@repo/ui/components/ImageUploader";
import { FileUploader } from "@repo/ui/components/FileUploader";

// Rich text editor (requires @tiptap peer dependencies)
import { RichTextEditor } from "@repo/ui/components/RichTextEditor";

// Image carousel modal
import { ImageCarouselModal } from "@repo/ui/components/ImageCarouselModal";

// Form-integrated upload wrappers (react-hook-form compatible)
import { ImageUploaderForm } from "@repo/ui/components/form/ImageUploaderForm";
import { FileUploaderForm } from "@repo/ui/components/form/FileUploaderForm";
import { MultiSelectForm } from "@repo/ui/components/form/MultiSelectForm";

// Skeleton loading variants
import { ... } from "@repo/ui/components/skeletons";

// Utilities
import { cn } from "@repo/ui/functions/cn";
import { isValidIconName } from "@repo/ui/functions/iconUtils";

// Styles (import once in root layout)
import "@repo/ui/styles.css";
```

### Why this matters

This strategy improves:

- tree-shaking
- consumer clarity
- bundle-size control
- long-term maintainability

It also prevents the root `index.ts` from becoming an oversized export surface for every module in the package.

---

## Build and Packaging

The package is configured for library distribution with a combination of:

- **TypeScript compiler (`tsc`)** for type-safe output (`build:components`)
- **Tailwind CLI** for CSS generation (`build:styles`)
- Package `exports` for controlled public entrypoints
- `sideEffects: ["**/*.css"]` to preserve CSS imports and prevent tree-shaking from removing styles

```bash
# Build components + CSS
pnpm --filter @repo/ui build

# Watch mode during development
pnpm --filter @repo/ui dev

# Type-check only
pnpm --filter @repo/ui check-types
```

### Dependencies

| Package                   | Type            | Purpose                                                    |
| ------------------------- | --------------- | ---------------------------------------------------------- |
| `clsx`                    | runtime         | Conditional class name composition                         |
| `tailwind-merge`          | runtime         | Merge Tailwind classes without conflicts                   |
| `lucide-react`            | runtime         | Icon set used by `Icon.tsx` and `icons.ts`                 |
| `@tiptap/react`           | peer (optional) | Rich text editor — required for `RichTextEditor`           |
| `@tiptap/starter-kit`     | peer (optional) | TipTap core extensions                                     |
| `@tiptap/extension-image` | peer (optional) | Image support for TipTap                                   |
| `@tiptap/extension-link`  | peer (optional) | Link support for TipTap                                    |
| `react-hook-form`         | peer (optional) | Required for form-integrated wrappers (`*Form` components) |

> Tiptap peer dependencies are **optional**. Only install them in apps that consume `RichTextEditor`.

---

## Functions, Hooks, and Shared Theme Abstractions

Shared non-visual logic is intentionally separated from components.

### Functions (`src/functions/`)

| Helper                  | Description                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `cn(...inputs)`         | Merges class names using `clsx` + `tailwind-merge`. Handles conditional classes and Tailwind conflicts. |
| `isValidIconName(name)` | Validates that a string is a valid `lucide-react` icon name. Used by the `Icon` component.              |
| `isValidUrl(url)`       | Checks whether a string is a valid HTTP or HTTPS URL.                                                   |

### Hooks (`src/hooks/`)

| Hook            | Description                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useDarkMode()` | Manages dark mode state. Reads from `localStorage`, falls back to `prefers-color-scheme`, and synchronizes across browser tabs via the `storage` event. Returns `{ isDark, theme, toggle, setTheme }`. |

### Theme abstractions (`src/components/`)

| Export          | Description                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| `ThemeProvider` | React context provider. Wraps the app root and exposes theme state.              |
| `useTheme`      | Hook for reading `isDark`, `theme`, `toggle`, and `setTheme` from context.       |
| `ThemeToggle`   | Button component that calls `toggle()` from `useTheme`. Renders a sun/moon icon. |

---

## Summary

`@repo/ui` is a pragmatic shared component package with:

- raw primitive-based architecture
- Tailwind-first styling
- isolated complex modules in `packages/ui/src/components/`
- custom theming support through `useDarkMode`, `ThemeProvider`, and `ThemeToggle`
- split exports for better bundle control
- production-friendly packaging for monorepo usage

It is optimized for teams that want a flexible internal UI system without overcommitting to heavyweight component frameworks.
