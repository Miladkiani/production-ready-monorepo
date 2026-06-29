import { print } from "graphql";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";

export type ExecuteGraphQLOptions = RequestInit & {
  timeoutMs?: number;
  skipCache?: boolean;
};

/**
 * Custom error class for GraphQL errors with enhanced context
 */
export class GraphQLError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "GraphQLError";
  }
}

/**
 * Intelligent cache configuration for different query types
 * All queries revalidate every 30 seconds for immediate content updates
 */
const getCacheConfig = (queryName: string): RequestInit => {
  if (queryName.includes("Preview") || queryName.includes("ForHome")) {
    return {
      next: {
        revalidate: 30,
        tags: [queryName, "homepage"],
      },
    };
  }

  if (
    queryName.includes("ProfileSummary") ||
    queryName.includes("ProfileResume")
  ) {
    return {
      next: {
        revalidate: 30,
        tags: [queryName, "profile"],
      },
    };
  }

  if (
    queryName.includes("BySlug") ||
    (queryName.includes("Article") && !queryName.includes("Articles"))
  ) {
    return {
      next: {
        revalidate: 30,
        tags: [queryName, "article-detail"],
      },
    };
  }

  if (
    queryName.includes("List") ||
    queryName.includes("Articles") ||
    queryName.includes("Certificates")
  ) {
    return {
      next: {
        revalidate: 30,
        tags: [queryName, "list"],
      },
    };
  }

  if (queryName.includes("Socials")) {
    return {
      next: {
        revalidate: 30,
        tags: [queryName, "socials"],
      },
    };
  }

  return {
    next: {
      revalidate: 30,
      tags: [queryName],
    },
  };
};

// Request deduplication cache: prevents duplicate concurrent requests
const requestCache = new Map<string, Promise<unknown>>();

// Generate cache key from query and variables
const getCacheKey = <TVariables>(
  query: TypedDocumentNode<unknown, TVariables>,
  variables?: TVariables,
): string => {
  const queryStr = print(query);
  const varsStr = variables ? JSON.stringify(variables) : "";
  return `${queryStr}:${varsStr}`;
};

const makeRequest = async <TData, TVariables>({
  payload,
  options,
}: {
  payload: {
    query: TypedDocumentNode<TData, TVariables>;
    variables?: TVariables;
  };
  options?: ExecuteGraphQLOptions;
}): Promise<TData> => {
  const { timeoutMs, ...fetchOptions } = options ?? {};

  const { query, variables } = payload;

  const controller = timeoutMs ? new AbortController() : undefined;
  let timeoutId: NodeJS.Timeout | undefined;

  if (timeoutMs && controller) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  const headers = {
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({ query: print(query), variables });

  // Extract query name for intelligent caching
  const queryString = query ? print(query) : "";
  const queryNameMatch = queryString.match(/(?:query|mutation)\s+(\w+)/);
  const queryName = queryNameMatch?.[1] || "unknown";

  const cacheConfig =
    fetchOptions.cache || fetchOptions.next ? {} : getCacheConfig(queryName);

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      credentials: "include",
      headers,
      body,
      signal: controller?.signal,
      ...cacheConfig,
      ...fetchOptions,
    });

    if (!res.ok) {
      let errorMessage: string;

      switch (res.status) {
        case 400:
          errorMessage =
            "Validation error. Please check your input and try again.";
          break;
        case 401:
          errorMessage = "Authentication required. Please log in.";
          break;
        case 403:
          errorMessage =
            "Access denied. You don't have permission for this action.";
          break;
        case 404:
          errorMessage = "Resource not found.";
          break;
        case 429:
          errorMessage =
            "Rate limit exceeded. Too many requests. Please try again later.";
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = "Server error. Please try again in a few moments.";
          break;
        default:
          errorMessage = `Request failed with status ${res.status}`;
      }

      throw new GraphQLError(errorMessage, res.status);
    }

    const json = await res.json();

    if (json.errors) {
      const graphqlError = json.errors[0];
      const message = graphqlError.message || "An error occurred";

      let userMessage = message;

      if (message.toLowerCase().includes("rate limit")) {
        userMessage =
          "You've reached the hourly submission limit. Please try again in 60 minutes.";
      } else if (message.toLowerCase().includes("validation")) {
        userMessage = `Validation error: ${message}`;
      } else if (message.toLowerCase().includes("unauthorized")) {
        userMessage = "Authentication required. Please log in.";
      } else if (message.toLowerCase().includes("forbidden")) {
        userMessage =
          "Access denied. You don't have permission for this action.";
      }

      throw new GraphQLError(userMessage, res.status, json.errors);
    }

    return json.data as TData;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new GraphQLError(
        "Network error. Please check your internet connection.",
        undefined,
        error,
      );
    }

    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.message.includes("timeout"))
    ) {
      throw new GraphQLError(
        "Request timed out. Please try again.",
        undefined,
        error,
      );
    }

    if (error instanceof GraphQLError) {
      throw error;
    }

    throw new GraphQLError(
      "An unexpected error occurred. Please try again.",
      undefined,
      error,
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

/**
 * Execute a GraphQL query or mutation
 */
export async function executeGraphQL<TData, TVariables = undefined>(
  payload: {
    query: TypedDocumentNode<TData, TVariables>;
    variables?: TVariables;
  },
  options?: ExecuteGraphQLOptions,
): Promise<TData> {
  const { skipCache, ...requestOptions } = options ?? {};

  // Skip deduplication if explicitly requested
  const shouldUseCache = !skipCache;

  if (shouldUseCache && payload.query) {
    const cacheKey = getCacheKey(payload.query, payload.variables);

    // Check if there's already a pending request for this query
    const cachedRequest = requestCache.get(cacheKey);
    if (cachedRequest) {
      return cachedRequest as Promise<TData>;
    }

    // Create new request and cache it
    const request = makeRequest({ payload, options: requestOptions })
      .then((data) => {
        // Remove from cache after successful completion
        requestCache.delete(cacheKey);
        return data;
      })
      .catch((error) => {
        // Remove from cache on error so retry is possible
        requestCache.delete(cacheKey);
        throw error;
      });

    requestCache.set(cacheKey, request);
    return request as Promise<TData>;
  }

  // No caching for file uploads or when skipCache is true
  return makeRequest({ payload, options: requestOptions });
}
