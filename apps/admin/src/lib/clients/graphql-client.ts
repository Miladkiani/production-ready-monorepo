import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";

// GraphQL endpoint URL
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";

export type ExecuteGraphQLOptions = RequestInit & {
  timeoutMs?: number;
  skipAuth?: boolean;
  /** Access token to use for this request (from AuthContext) */
  accessToken?: string | null;
};

/**
 * Make a GraphQL request
 */
const makeRequest = async <TData, TVariables>({
  options,
  token,
  payload,
}: {
  payload: {
    query: TypedDocumentNode<TData, TVariables>;
    variables?: TVariables;
  };
  token?: string | null;
  options?: ExecuteGraphQLOptions;
}): Promise<TData> => {
  const { timeoutMs, skipAuth, accessToken, ...fetchOptions } = options ?? {};

  const { query, variables } = payload;

  const controller = timeoutMs ? new AbortController() : undefined;
  let timeoutId: NodeJS.Timeout | undefined;

  if (timeoutMs && controller) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
  };

  const body = JSON.stringify({ query: print(query), variables });

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      credentials: "include", // Include cookies for token refresh
      headers,
      body,
      signal: controller?.signal,
      ...fetchOptions,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();

    // Check for authentication errors
    if (
      json.errors?.some(
        (e: { extensions?: { code?: string } }) =>
          e.extensions?.code === "UNAUTHENTICATED",
      )
    ) {
      throw new Error("UNAUTHENTICATED");
    }

    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    return json.data as TData;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

/**
 * Execute a GraphQL query or mutation (Client-side)
 *
 * USAGE:
 * Pass the access token from AuthContext for authenticated requests.
 *
 * @example
 * const { accessToken } = useAuth();
 * const data = await executeGraphQL(
 *   { query: MyQueryDocument, variables: { id: "123" } },
 *   { accessToken }
 * );
 */
export async function executeGraphQL<TData, TVariables = undefined>(
  payload: {
    query: TypedDocumentNode<TData, TVariables>;
    variables?: TVariables;
  },
  options?: ExecuteGraphQLOptions,
): Promise<TData> {
  const token = options?.accessToken;

  try {
    return await makeRequest({ payload, options, token });
  } catch (err) {
    const error = err as Error;

    // On authentication error, redirect to login
    // Note: Middleware should have already handled this, but this is a fallback
    if (error.message === "UNAUTHENTICATED") {
      // Use hard redirect to let middleware handle re-authentication
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw error;
    }

    throw err;
  }
}
