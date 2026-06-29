/**
 * Main library exports
 * Provides access to all library modules
 */

// Authentication utilities
export * from "./auth";
export type { AuthUser } from "./auth";

// GraphQL client (client-side)
export { executeGraphQL } from "./clients/graphql-client";
export type { ExecuteGraphQLOptions } from "./clients/graphql-client";

// Upload utilities
export {
  uploadAvatar,
  uploadResume,
  uploadArticleImage,
  uploadSocialIcon,
  uploadResumePages,
  deleteFile,
  uploadPdf,
} from "./clients/upload-client";
export type {
  UploadResponse,
  MultiUploadResponse,
  DeleteResponse,
} from "./clients/upload-client";

// Server-only GraphQL client - DO NOT import in barrel export
// Import directly: import { executeServerGraphQL } from "@admin/lib/clients/graphql-server"
