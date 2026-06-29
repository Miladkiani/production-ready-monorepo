"use client";

import { ReactNode } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

/**
 * CaptchaProvider - Conditional wrapper for Google reCAPTCHA v3
 *
 * SECURITY ARCHITECTURE:
 * - Only loads reCAPTCHA if NEXT_PUBLIC_RECAPTCHA_SITE_KEY is configured
 * - Graceful degradation: If no key, renders children without CAPTCHA
 * - Development-friendly: No CAPTCHA overhead during development
 * - Production-ready: Add key to environment → instant activation
 * - CSP Compliant: Uses nonce for inline script execution
 *
 * PERFORMANCE:
 * - No external scripts loaded if key is missing
 * - Zero overhead in development mode
 * - Lazy script loading in production
 *
 * USAGE:
 * Wrap your app with this provider in layout.tsx
 */
export function CaptchaProvider({
  children,
  nonce,
}: {
  children: ReactNode;
  nonce?: string;
}) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Development mode: No CAPTCHA key configured
  if (!siteKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "🔓 reCAPTCHA is disabled: NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured",
      );
    }
    return <>{children}</>;
  }

  // Production mode: CAPTCHA enabled
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
        nonce: nonce, // CSP nonce for script execution
      }}
      container={{
        parameters: {
          badge: "bottomright", // Position of reCAPTCHA badge
          theme: "light",
        },
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
