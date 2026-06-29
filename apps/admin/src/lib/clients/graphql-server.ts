import "server-only";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// 🚀 SERVER-SIDE: Use internal Docker network URL for better performance
// In Docker: http://backend:3001/graphql (direct container-to-container)
// Fallback: public URL for local development
// CRITICAL: Order matters! GRAPHQL_URL must come before NEXT_PUBLIC_GRAPHQL_URL
// because NEXT_PUBLIC_GRAPHQL_URL may be a relative path (/api/graphql) which
// doesn't work in Server Components (fetch needs an absolute URL)
const GRAPHQL_URL =
  process.env.GRAPHQL_INTERNAL_URL ||
  process.env.GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  "http://localhost:4000/graphql";

// Get basePath for redirects (must match next.config.ts)
const basePath = process.env.NEXT_PUBLIC_ADMIN_PATH || "";

/**
 * Options for executeServerGraphQL
 */
export type ExecuteServerGraphQLOptions = {
  /** Request cache strategy */
  cache?: RequestCache;
  /** Skip authentication (for public queries) */
  skipAuth?: boolean;
  /** Timeout in milliseconds */
  timeoutMs?: number;
  /** Redirect to login if not authenticated (default: true) */
  redirectOnAuthFail?: boolean;
};

/**
 * Cache configuration for different query types
 */
const getCacheConfig = (
  queryName: string,
): { cache?: RequestCache; next?: { revalidate: number; tags: string[] } } => {
  // List queries - cache for 60 seconds with revalidation
  if (
    queryName.includes("List") ||
    (queryName.includes("s") && !queryName.includes("By"))
  ) {
    return { next: { revalidate: 60, tags: [queryName] } };
  }

  // Detail queries - cache for 5 minutes
  if (queryName.includes("ById") || queryName.includes("BySlug")) {
    return { next: { revalidate: 300, tags: [queryName] } };
  }

  // Profile/auth queries - no cache
  if (queryName.includes("Profile") || queryName.includes("Auth")) {
    return { cache: "no-store" as RequestCache };
  }

  // Default: cache for 30 seconds
  return { next: { revalidate: 30, tags: [queryName] } };
};

/**
 * SERVER-SIDE ONLY: Execute GraphQL queries from Server Components
 *
 * ARCHITECTURE (Next.js 15 Compatible):
 * - Middleware refreshes access token and sets it in Authorization header
 * - This function reads token from headers (NOT cookies)
 * - Uses internal Docker URL for direct backend communication
 * - Intelligent caching based on query type
 *
 * NOTE: In Next.js 15, middleware sets cookies on the RESPONSE, which are NOT
 * available to Server Components via cookies() in the SAME request cycle.
 * However, headers set via requestHeaders ARE available via headers().
 *
 * @param payload - GraphQL query and variables
 * @param options - Optional settings (cache, skipAuth, timeoutMs, redirectOnAuthFail)
 * @returns Query result data
 *
 * @example
 * // Basic usage (redirects to login if not authenticated)
 * const data = await executeServerGraphQL({ query: GetProfileDocument });
 *
 * @example
 * // With variables and custom cache
 * const data = await executeServerGraphQL({
 *   query: GetArticleDocument,
 *   variables: { id: "123" }
 * }, { cache: "no-store" });
 *
 * @example
 * // Throw error instead of redirect (for error boundaries)
 * const data = await executeServerGraphQL(
 *   { query: GetProfileDocument },
 *   { redirectOnAuthFail: false }
 * );
 */
export async function executeServerGraphQL<TData, TVariables = undefined>(
  payload: {
    query: TypedDocumentNode<TData, TVariables>;
    variables?: TVariables;
  },
  options?: ExecuteServerGraphQLOptions,
): Promise<TData> {
  const {
    cache,
    skipAuth = false,
    timeoutMs,
    redirectOnAuthFail = true,
  } = options ?? {};
  const { query, variables } = payload;

  // Get access token from Authorization header (middleware sets this after refreshing)
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  // Handle missing token
  if (!accessToken && !skipAuth) {
    if (redirectOnAuthFail) {
      console.warn(
        "[executeServerGraphQL] No Authorization header found - redirecting to login",
      );
      const loginPath = basePath ? `${basePath}/login` : "/login";
      redirect(loginPath);
    } else {
      throw new Error(
        "No access token found in Authorization header - middleware should have set this",
      );
    }
  }

  // Setup timeout if specified
  const controller = timeoutMs ? new AbortController() : undefined;
  let timeoutId: NodeJS.Timeout | undefined;

  if (timeoutMs && controller) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  // Build request headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(accessToken && !skipAuth
      ? { Authorization: `Bearer ${accessToken}` }
      : {}),
  };

  // Extract query name for intelligent caching
  const queryString = print(query);
  const queryNameMatch = queryString.match(/(?:query|mutation)\s+(\w+)/);
  const queryName = queryNameMatch?.[1] || "unknown";

  // Get cache configuration (explicit cache option overrides auto-detection)
  const cacheConfig = cache ? { cache } : getCacheConfig(queryName);

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        query: queryString,
        variables,
      }),
      signal: controller?.signal,
      ...cacheConfig,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `GraphQL HTTP Error ${res.status}: ${res.statusText} - ${errorText}`,
      );
    }

    const json = await res.json();

    if (json.errors) {
      const errorMessage = json.errors
        .map((e: { message: string }) => e.message)
        .join(", ");
      throw new Error(`GraphQL Error: ${errorMessage}`);
    }

    return json.data as TData;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
