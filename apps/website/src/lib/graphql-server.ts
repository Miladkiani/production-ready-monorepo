import "server-only";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";

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

/**
 * Cache configuration for different query types
 * All queries revalidate every 30 seconds for immediate content updates
 */
const getCacheConfig = (queryName: string) => {
  // Homepage data - cache for 30 seconds
  if (queryName.includes("Preview") || queryName.includes("ForHome")) {
    return { next: { revalidate: 30, tags: [queryName, "homepage"] } };
  }

  // Profile data - cache for 30 seconds
  if (
    queryName.includes("ProfileSummary") ||
    queryName.includes("ProfileResume")
  ) {
    return { next: { revalidate: 30, tags: [queryName, "profile"] } };
  }

  // Article detail - cache for 30 seconds
  if (
    queryName.includes("BySlug") ||
    (queryName.includes("Article") && !queryName.includes("Articles"))
  ) {
    return { next: { revalidate: 30, tags: [queryName, "article-detail"] } };
  }

  // List queries - cache for 30 seconds
  if (
    queryName.includes("List") ||
    queryName.includes("Articles") ||
    queryName.includes("Certificates")
  ) {
    return { next: { revalidate: 30, tags: [queryName, "list"] } };
  }

  // Social links - cache for 30 seconds
  if (queryName.includes("Socials")) {
    return { next: { revalidate: 30, tags: [queryName, "socials"] } };
  }

  // Default: cache for 30 seconds
  return { next: { revalidate: 30, tags: [queryName] } };
};

/**
 * SERVER-SIDE ONLY: Execute GraphQL queries in Server Components
 * Uses internal Docker network for direct backend communication
 * Provides better performance compared to going through nginx
 *
 * @param payload - GraphQL query and variables
 * @returns Query result data
 */
export async function executeServerGraphQL<
  TData,
  TVariables = undefined,
>(payload: {
  query: TypedDocumentNode<TData, TVariables>;
  variables?: TVariables;
  cache?: RequestCache;
}): Promise<TData> {
  const { query, variables, cache } = payload;

  // Extract query name for intelligent caching
  const queryString = print(query);
  const queryNameMatch = queryString.match(/(?:query|mutation)\s+(\w+)/);
  const queryName = queryNameMatch?.[1] || "unknown";

  // Get cache configuration
  const cacheConfig = cache ? { cache } : getCacheConfig(queryName);

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: queryString,
      variables,
    }),
    ...cacheConfig,
  });

  if (!res.ok) {
    console.error(
      `[executeServerGraphQL] HTTP ${res.status}: ${res.statusText}`,
    );
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    console.error("[executeServerGraphQL] GraphQL errors:", json.errors);
    throw new Error(json.errors[0].message);
  }

  return json.data as TData;
}
