import { Container } from "../shared/Container";
import { Typography, Icon } from "@repo/ui";
import Link from "next/link";
import Image from "next/image";

export async function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="border-t border-border bg-surface/30" role="contentinfo">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <Link href="/" className="flex items-center gap-3 w-fit group">
                <div className="relative w-14 h-14 rounded-xl bg-surface border border-border shadow-md overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                  <Image
                    src="/icon-192.png"
                    alt="App Logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Typography
                  variant="h4"
                  weight="bold"
                  className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                  as="h2"
                >
                  Turborepo Starter
                </Typography>
              </Link>
              <Typography
                variant="body"
                color="text-secondary"
                className="mt-3 max-w-sm"
              >
                A production-ready fullstack monorepo starter with Next.js,
                NestJS, GraphQL, and Turborepo.
              </Typography>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <Typography
              variant="h6"
              weight="semibold"
              color="text-primary"
              as="h2"
            >
              Quick Links
            </Typography>
            <nav
              className="flex flex-col space-y-2"
              aria-label="Footer navigation"
            >
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-text-secondary hover:text-accent transition-colors duration-200 text-sm inline-flex items-center gap-2 group w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:rounded px-2 py-1"
                >
                  <Icon
                    name="ChevronRight"
                    size={14}
                    color="text-muted"
                    className="group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                    aria-hidden="true"
                  />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 space-y-4">
            <Typography
              variant="h6"
              weight="semibold"
              color="text-primary"
              as="h2"
            >
              Get In Touch
            </Typography>
            <a
              href="#contact"
              className="group flex items-start gap-3 text-sm text-text-secondary hover:text-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:rounded px-2 py-1"
              aria-label="Navigate to contact form"
            >
              <Icon
                name="Mail"
                size={18}
                color="text-muted"
                className="group-hover:text-accent transition-colors mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <span>Send us a message</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Typography
              variant="caption"
              color="muted"
              className="text-center md:text-left"
            >
              © {currentYear} Fullstack Turborepo Starter. All rights reserved.
            </Typography>
          </div>
        </div>
      </Container>
    </footer>
  );
}
