/**
 * Authentication context and utilities
 */

export { AuthProvider, useAuth } from "./auth-context";
export type { AuthUser } from "./auth-context";

// Legacy exports (kept for backward compatibility, may be removed later)
export { redirectToLogin } from "./auth-redirect";

// Server-only GraphQL - DO NOT export in barrel
// Import directly: import { executeServerGraphQL } from "@admin/lib/clients/graphql-server"
