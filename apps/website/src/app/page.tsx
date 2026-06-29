import { ContactSkeleton } from "@website/components/home";
import { AnimatedSection } from "@website/components/layout";
import type { Metadata } from "next";
import { default as dynamicImport } from "next/dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch using the contact form. We'd love to hear from you.",
  openGraph: {
    title: "Contact — Fullstack Turborepo Starter",
    description:
      "Get in touch using the contact form. We'd love to hear from you.",
    url: "/",
    type: "website",
  },
};

const ContactWithAPI = dynamicImport(
  () =>
    import("@website/components/home/ContactWithAPI").then((mod) => ({
      default: mod.ContactWithAPI,
    })),
  {
    loading: () => <ContactSkeleton />,
  },
);

// ISR Configuration: Revalidate every 30 seconds for immediate content updates
export const revalidate = 30;

// Dynamic rendering: Skip static generation at build time
// Pages will be generated on-demand (first request) and cached via ISR
// This allows Docker builds to succeed without requiring backend availability
export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <>
      <AnimatedSection animation="fade-up" delay={150}>
        <ContactWithAPI />
      </AnimatedSection>
    </>
  );
}
