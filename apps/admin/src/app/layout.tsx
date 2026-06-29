import "./global.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "@repo/ui";
import { AuthProvider, type AuthUser } from "@admin/lib";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Optimized font loading - show text immediately with fallback
  preload: true,
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true, // Reduce layout shift
});

export const metadata = {
  title: "Admin Dashboard — Turborepo Starter",
  description: "Admin panel for managing your application content.",
  // Icons configuration for browsers and Apple devices
  // Note: favicon.ico is automatically handled by Next.js from app/favicon.ico
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

/**
 * Root Layout - Server Component
 *
 * ARCHITECTURE:
 * - Reads auth state from headers (set by middleware)
 * - Passes auth state to AuthProvider as props
 * - AuthProvider initializes immediately (no client fetch)
 * - This eliminates the /api/auth/token round-trip
 */
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Read auth state from headers (set by middleware)
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const userHeader = headersList.get("x-auth-user");

  // Extract token and user from headers
  const accessToken = authHeader?.replace("Bearer ", "") || null;
  let user: AuthUser | null = null;

  if (userHeader) {
    try {
      user = JSON.parse(userHeader);
    } catch {
      // Invalid user header, ignore
    }
  }

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Blocking script to prevent theme flash - runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
                  
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fail silently if localStorage is not available
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider>
          <AuthProvider initialUser={user} initialToken={accessToken}>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
