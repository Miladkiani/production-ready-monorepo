import { cookies } from "next/headers";

/**
 * Get CSP nonce for the current request
 *
 * ARCHITECTURE (Next.js 15 Compatible):
 * - The middleware generates a unique nonce per request
 * - Nonce is stored in a cookie (NOT header) because middleware
 *   header modifications don't propagate to Server Components
 * - Use this function to get the nonce in Server Components
 * - Add nonce attribute to inline scripts: <script nonce={nonce}>
 *
 * @returns The nonce string for this request, or undefined if not available
 *
 * @example Server Component
 * ```tsx
 * import { getNonce } from '@/lib/csp-nonce';
 *
 * export default async function MyPage() {
 *   const nonce = await getNonce();
 *   return (
 *     <script nonce={nonce}>
 *       console.log('This script is allowed by CSP');
 *     </script>
 *   );
 * }
 * ```
 */
export async function getNonce(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("csp-nonce")?.value || undefined;
}
