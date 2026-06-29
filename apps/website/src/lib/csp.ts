import { headers } from "next/headers";

/**
 * Get the CSP nonce for the current request
 *
 * LEARNING: What is a nonce?
 * - Nonce = "Number used once"
 * - A random string generated per request
 * - Allows specific inline scripts while blocking others
 *
 * HOW IT WORKS:
 * 1. Middleware generates nonce: "abc123xyz"
 * 2. CSP header says: script-src 'nonce-abc123xyz'
 * 3. Your inline script has: <script nonce="abc123xyz">
 * 4. ✅ Browser allows this script (nonce matches)
 * 5. ❌ Browser blocks attacker's script (no matching nonce)
 *
 * USAGE in Server Components:
 * ```tsx
 * import { getNonce } from '@/lib/csp';
 *
 * export default async function Page() {
 *   const nonce = await getNonce();
 *   return (
 *     <div>
 *       <Script nonce={nonce} src="/some-script.js" />
 *     </div>
 *   );
 * }
 * ```
 */
export async function getNonce(): Promise<string | undefined> {
  const headersList = await headers();
  return headersList.get("x-nonce") || undefined;
}

/**
 * CSP Nonce Context Provider
 *
 * LEARNING: Why can't we use nonce in Client Components?
 * - CSP nonce is generated server-side per request
 * - Client Components don't have access to request headers
 * - Solution: Pass nonce through props or use Server Components
 *
 * For most cases, Next.js automatically handles nonces for:
 * - next/script components
 * - Inline scripts in Server Components
 */
