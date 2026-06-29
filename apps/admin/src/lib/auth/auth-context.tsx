"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { LogoutDocument } from "@repo/graphql";
import { print } from "graphql";

// ============================================================================
// CONFIGURATION
// ============================================================================

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

// ============================================================================
// TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, user?: AuthUser) => void;
  logout: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER PROPS
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
  /**
   * Initial user from server (passed from Server Component via headers)
   * If provided, AuthProvider initializes immediately without loading state
   */
  initialUser?: AuthUser | null;
  /**
   * Initial access token from server
   * Used for client-side API calls after hydration
   */
  initialToken?: string | null;
}

// ============================================================================
// JWT DECODER (Client-side)
// ============================================================================

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const decoded = JSON.parse(payload);
    return {
      id: decoded.sub || decoded.id,
      email: decoded.email || "",
      role: decoded.role || "USER",
    };
  } catch {
    return null;
  }
}

// ============================================================================
// AUTH PROVIDER
// ============================================================================

/**
 * AuthProvider - Client-side Authentication State Manager
 *
 * ARCHITECTURE (Optimized for Next.js 15):
 * - Receives initial auth state from Server Component (no client fetch needed)
 * - Middleware is the single source of truth for token validation/refresh
 * - AuthProvider only manages client-side state (login, logout)
 * - No useEffect for initialization - instant render
 *
 * FLOW:
 * 1. Middleware validates/refreshes token
 * 2. Middleware sets x-auth-user header
 * 3. Server Component reads header, passes to AuthProvider as props
 * 4. AuthProvider initializes immediately with server-provided state
 */
export function AuthProvider({
  children,
  initialUser = null,
  initialToken = null,
}: AuthProviderProps) {
  // Initialize from server-provided values (no loading state needed!)
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [accessToken, setAccessToken] = useState<string | null>(initialToken);
  const router = useRouter();

  // Derived state - no loading if we have initial values from server
  // If no initial values, we're on login page (unauthenticated)
  const isLoading = false; // Never loading - middleware already handled auth
  const isAuthenticated = !!accessToken && !!user;

  /**
   * Login - Called after successful authentication
   * Updates client state after login form submission
   */
  const login = useCallback((token: string, providedUser?: AuthUser) => {
    const decodedUser = providedUser || decodeJwtPayload(token);
    setAccessToken(token);
    setUser(decodedUser);
  }, []);

  /**
   * Logout - Clear state and call backend
   * Backend clears refreshToken cookie, we clear client state
   */
  const logout = useCallback(async () => {
    try {
      // Call backend to clear refreshToken cookie
      await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: print(LogoutDocument) }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear client state
      setAccessToken(null);
      setUser(null);

      // Clear auth-status cookie (non-HttpOnly, we can clear it)
      if (typeof document !== "undefined") {
        const domainPart = COOKIE_DOMAIN ? `; domain=${COOKIE_DOMAIN}` : "";
        document.cookie = `auth-status=; path=/${domainPart}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
      }

      // Redirect to login
      // Use relative path - Next.js adds basePath automatically
      router.push("/login");
    }
  }, [router]);

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useAuth - Access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
