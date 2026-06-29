"use client";

import {
  Button,
  Input,
  Typography,
  toast,
  Icon,
  ThemeToggle,
  Checkbox,
} from "@repo/ui";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuth } from "@admin/lib";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@repo/validation";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { LoginDocument } from "@repo/graphql";
import { print } from "graphql";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Get redirect URL from query params (where user was trying to go)
  const from = searchParams.get("from") || "/";

  // Setup form with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (formData: LoginInput) => {
    setLoading(true);

    try {
      // Execute reCAPTCHA v3 before login
      let captchaToken: string | undefined;

      if (executeRecaptcha) {
        try {
          captchaToken = await executeRecaptcha("login");
        } catch (captchaError) {
          console.warn("reCAPTCHA execution failed:", captchaError);
          // Continue without CAPTCHA token - backend has graceful degradation
        }
      }

      const res = await fetch(
        process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Critical: receives HttpOnly refresh token cookie
          body: JSON.stringify({
            query: print(LoginDocument),
            variables: {
              input: {
                email: formData.email,
                password: formData.password,
                captchaToken,
              },
            },
          }),
        },
      );

      const { data, errors } = await res.json();

      if (errors?.length) {
        throw new Error(errors[0].message);
      }

      const accessToken = data?.login?.accessToken;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      // Store access token in auth context (memory)
      login(accessToken);

      // Wait a bit to ensure state updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      toast.success({ title: "Welcome back!" });

      router.push(from);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Login error:", err);
      toast.error({ title: "Login failed", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden p-4 sm:p-6">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

      {/* Decorative Shapes - Contained within viewport */}
      <div className="absolute top-[10%] left-[5%] h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-primary/20 blur-3xl animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-[10%] right-[5%] h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-secondary/20 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      {/* Login Card - Centered with no scroll */}
      <section
        className="relative w-full max-w-[min(90vw,28rem)] sm:max-w-[min(90vw,32rem)] md:max-w-[min(90vw,32rem)]  animate-fade-in-up z-10"
        role="region"
        aria-labelledby="login-heading"
      >
        {/* Glass Card Effect */}
        <div className="rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-2xl shadow-black/20 dark:shadow-black/40">
          <div className="p-6 sm:p-8">
            {/* Logo Area */}
            <div className="mb-6 flex justify-center">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-2 ring-primary/20">
                <Image
                  src="/icon-192.png"
                  alt="Admin Dashboard Logo"
                  width={64}
                  height={64}
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6 text-center">
              <Typography
                as="h1"
                id="login-heading"
                className="mb-1 text-xl font-bold text-text-primary sm:text-2xl"
              >
                Welcome Back
              </Typography>
              <Typography as="p" className="text-sm text-text-muted">
                Sign in to access your admin dashboard
              </Typography>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input */}
              <Input
                id="email"
                type="email"
                autoComplete="email"
                label="Email Address"
                placeholder="admin@example.com"
                leftIcon="Mail"
                error={errors.email?.message}
                {...register("email")}
                className="transition-all duration-300"
              />

              {/* Password Input */}
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                label="Password"
                placeholder="••••••••"
                leftIcon="Lock"
                rightIcon={showPassword ? "EyeOff" : "Eye"}
                onRightIconClick={() => setShowPassword(!showPassword)}
                error={errors.password?.message}
                {...register("password")}
                className="transition-all duration-300"
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <Checkbox
                  id="remember"
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <button
                  type="button"
                  disabled
                  className="group relative text-sm font-medium text-text-muted hover:text-primary transition-colors cursor-not-allowed"
                >
                  Forgot password?
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-hover px-2 py-1 text-xs text-text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity border border-border">
                    Coming Soon
                  </span>
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                fullWidth
                size="lg"
                className="mt-4 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Icon name="Loader" size={18} className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icon name="LogIn" size={18} />
                    Sign In
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Footer - Compact security badge */}
          <div className="border-t border-border bg-surface/60 px-6 py-3 rounded-b-2xl">
            <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
              <div className="flex items-center gap-1">
                <Icon name="Lock" size={12} className="text-primary" />
                <span>SSL</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1">
                <Icon name="Shield" size={12} className="text-success" />
                <span>JWT</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1">
                <Icon name="Cookie" size={12} className="text-secondary" />
                <span>HttpOnly</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
