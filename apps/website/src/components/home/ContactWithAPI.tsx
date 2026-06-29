"use client";

import type { SocialLinkData } from "@website/types/social";
import { Contact } from "./Contact";
import type { ContactInfoItem } from "./contact/ContactInfo";
import { useSubmitContactForm } from "@website/hooks/useSubmitContactForm";
import { useCallback } from "react";

interface ContactWithAPIProps {
  title?: string;
  subtitle?: string;
  description?: string;
  socials?: SocialLinkData[];
  contactInfo?: ContactInfoItem[];
}

export function ContactWithAPI({
  title,
  subtitle,
  description,
  socials,
  contactInfo,
}: ContactWithAPIProps) {
  const { submitContactForm } = useSubmitContactForm();

  const handleSubmit = useCallback(
    async (data: { name: string; email: string; message: string }) => {
      await submitContactForm(data);
    },
    [submitContactForm],
  );

  return (
    <Contact
      title={title}
      subtitle={subtitle}
      description={description}
      contactInfo={contactInfo}
      onFormSubmit={handleSubmit}
    />
  );
}

// Default export for dynamic import
export default ContactWithAPI;
