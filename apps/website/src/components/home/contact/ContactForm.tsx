"use client";

import { useState, useId, useCallback, memo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Textarea, Button, Typography } from "@repo/ui";
import { createContactMessageSchema } from "@repo/validation";
import type { z } from "zod";

type FormStatus = "idle" | "sending" | "success" | "error";

type FormData = z.infer<typeof createContactMessageSchema>;

interface ContactFormProps {
  onSubmit?: (data: FormData) => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

export const ContactForm = memo(function ContactForm({
  onSubmit,
  successMessage = "Thank you! Your message has been sent successfully. I'll get back to you soon.",
  errorMessage = "Oops! Something went wrong. Please try again or contact me directly via email.",
}: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const formId = useId();

  const lastSubmitTimeRef = useRef<number>(0);
  const DEBOUNCE_DELAY = 2000;

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(createContactMessageSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const now = Date.now();
      const timeSinceLastSubmit = now - lastSubmitTimeRef.current;

      if (
        timeSinceLastSubmit < DEBOUNCE_DELAY &&
        lastSubmitTimeRef.current !== 0
      ) {
        // Submission debounced
        return;
      }

      lastSubmitTimeRef.current = now;
      setStatus("sending");
      setErrorDetails(null);

      try {
        if (onSubmit) {
          await onSubmit(formData);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        setStatus("success");
        reset();

        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } catch (error) {
        console.error("Form submission error:", error);
        setStatus("error");

        if (error instanceof Error) {
          setErrorDetails(error.message);
        }

        setTimeout(() => {
          setStatus("idle");
          setErrorDetails(null);
        }, 8000);
      }
    },
    [onSubmit, reset],
  );

  return (
    <div className="w-full">
      <form
        id={formId}
        onSubmit={handleFormSubmit(handleSubmit)}
        className="flex flex-col gap-5"
        aria-label="Contact form"
        noValidate
      >
        {/* Name Input */}
        <div>
          <label htmlFor={`${formId}-name`} className="sr-only">
            Your Name
          </label>
          <Input
            id={`${formId}-name`}
            type="text"
            placeholder="Your Name"
            {...register("name")}
            disabled={status === "sending" || status === "success"}
            className="w-full"
            aria-label="Your name"
            error={errors.name?.message}
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor={`${formId}-email`} className="sr-only">
            Your Email
          </label>
          <Input
            id={`${formId}-email`}
            type="email"
            placeholder="Your Email"
            {...register("email")}
            disabled={status === "sending" || status === "success"}
            className="w-full"
            aria-label="Your email address"
            error={errors.email?.message}
          />
        </div>

        {/* Message Textarea */}
        <div>
          <label htmlFor={`${formId}-message`} className="sr-only">
            Your Message
          </label>
          <Textarea
            id={`${formId}-message`}
            placeholder="Your Message (minimum 10 characters)"
            rows={6}
            {...register("message")}
            disabled={status === "sending" || status === "success"}
            className="w-full resize-none"
            aria-label="Your message"
            error={errors.message?.message}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={status === "sending" || status === "success"}
          isLoading={status === "sending"}
          variant="solid"
          size="lg"
          className="w-full"
          icon={
            status === "success"
              ? "CheckCircle"
              : status === "error"
                ? "AlertCircle"
                : "Send"
          }
        >
          {status === "sending" && "Sending..."}
          {status === "success" && "Sent Successfully!"}
          {status === "error" && "Try Again"}
          {status === "idle" && "Send Message"}
        </Button>
      </form>

      {/* Success Message */}
      {status === "success" && (
        <div
          className="mt-6 p-4 bg-success/10 border border-success/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
          role="alert"
          aria-live="polite"
        >
          <Typography variant="body" className="text-center text-success">
            {successMessage}
          </Typography>
        </div>
      )}

      {/* Error Message */}
      {status === "error" && (
        <div
          className="mt-6 p-4 bg-error/10 border border-error/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
          role="alert"
          aria-live="assertive"
        >
          <Typography variant="body" color="error" className="text-center">
            {errorDetails || errorMessage}
          </Typography>
        </div>
      )}
    </div>
  );
});
