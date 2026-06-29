import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import {
  Footer,
  Header,
  ScrollProgressBar,
  BackToTop,
} from "@website/components/layout";
import { ThemeProvider } from "@repo/ui";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Fullstack Turborepo Starter",
    template: "%s | Fullstack Turborepo Starter",
  },
  description:
    "A production-ready fullstack monorepo starter built with Next.js, NestJS, GraphQL, Prisma, and Turborepo.",
  keywords: [
    "Next.js",
    "NestJS",
    "Turborepo",
    "GraphQL",
    "TypeScript",
    "Monorepo",
    "Fullstack",
    "Starter Template",
  ],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  publisher: "Your Name",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Fullstack Turborepo Starter",
    description:
      "A production-ready fullstack monorepo starter built with Next.js, NestJS, GraphQL, Prisma, and Turborepo.",
    siteName: "Fullstack Turborepo Starter",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Fullstack Turborepo Starter",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "Fullstack Turborepo Starter",
    description:
      "A production-ready fullstack monorepo starter built with Next.js, NestJS, GraphQL, Prisma, and Turborepo.",
    images: ["/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icon-512.png",
        color: "#4f46e5",
      },
    ],
  },
};

export const revalidate = 30;

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* Preconnect to API domain for faster requests */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}
        />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}
        />
      </head>
      <body className="bg-background text-text-primary antialiased">
        <ThemeProvider>
          <ScrollProgressBar />

          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Skip to main content
          </a>

          <Header />

          <main id="main-content" role="main">
            {children}
          </main>

          <Footer />

          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
