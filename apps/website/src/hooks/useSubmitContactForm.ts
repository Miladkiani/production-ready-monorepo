"use client";

import { useState } from "react";
import { executeGraphQL } from "@website/lib/graphql-client";
import { SubmitContactFormDocument } from "@repo/graphql";

interface SubmitContactFormInput {
  name: string;
  email: string;
  message: string;
}

interface ContactMessageResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
  } | null;
}

interface UseSubmitContactFormResult {
  submitContactForm: (input: SubmitContactFormInput) => Promise<void>;
  loading: boolean;
  error: Error | null;
  data: ContactMessageResponse | null;
}

export function useSubmitContactForm(): UseSubmitContactFormResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ContactMessageResponse | null>(null);

  const submitContactForm = async (input: SubmitContactFormInput) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await executeGraphQL(
        {
          query: SubmitContactFormDocument,
          variables: { input },
        },
        {
          cache: "no-store",
        },
      );

      setData(result.submitContactForm);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitContactForm,
    loading,
    error,
    data,
  };
}
