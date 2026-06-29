import { ReactNode } from "react";
import { CaptchaProvider } from "@admin/lib/auth/captcha-provider";
import { cookies } from "next/headers";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get CSP nonce from cookie (middleware sets this)
  // NOTE: In Next.js 15, middleware headers don't propagate to Server Components,
  // so we read from cookies instead
  const nonce = (await cookies()).get("csp-nonce")?.value ?? undefined;

  return (
    <div className="min-h-screen bg-background">
      <CaptchaProvider nonce={nonce}>{children}</CaptchaProvider>
    </div>
  );
}
