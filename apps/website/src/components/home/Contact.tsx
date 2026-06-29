import type { SocialLinkData } from "@website/types/social";
import { ContactForm } from "./contact/ContactForm";
import { ContactHeader } from "./contact/ContactHeader";
import { ContactInfo, type ContactInfoItem } from "./contact/ContactInfo";

interface ContactProps {
  title?: string;
  subtitle?: string;
  description?: string;
  contactInfo?: ContactInfoItem[];
  onFormSubmit?: (data: {
    name: string;
    email: string;
    message: string;
  }) => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

export function Contact({
  title,
  subtitle,
  description,
  contactInfo = [],
  onFormSubmit,
  successMessage,
  errorMessage,
}: ContactProps) {
  return (
    <section
      id="contact"
      className="py-16 md:py-20 bg-gradient-to-b from-background to-surface/30 border-t border-border"
      aria-labelledby="contact-heading"
    >
      <div className="container mx-auto max-w-6xl px-6">
        {/* Header */}
        <ContactHeader
          title={title}
          subtitle={subtitle}
          description={description}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Contact Info & Socials (Desktop Only) */}
          <div className="hidden lg:block space-y-8">
            {contactInfo.length > 0 && <ContactInfo items={contactInfo} />}
          </div>

          {/* Right Column - Contact Form (Centered on Mobile) */}
          <div className="w-full max-w-lg mx-auto lg:max-w-none lg:mx-0">
            <ContactForm
              onSubmit={onFormSubmit}
              successMessage={successMessage}
              errorMessage={errorMessage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
