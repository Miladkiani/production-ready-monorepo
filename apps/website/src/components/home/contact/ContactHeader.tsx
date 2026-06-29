import { Typography } from "@repo/ui";

interface ContactHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export function ContactHeader({
  title = "Let's Work Together",
  subtitle = "I'm always open to discussing new projects or opportunities",
  description,
}: ContactHeaderProps) {
  return (
    <div className="text-center mb-12">
      <Typography
        variant="h1"
        weight="semibold"
        className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3"
      >
        {title}
      </Typography>

      <Typography variant="h6" color="muted" className="max-w-2xl mx-auto">
        {subtitle}
      </Typography>

      {description && (
        <Typography
          variant="body"
          color="text-secondary"
          className="mt-4 max-w-xl mx-auto"
        >
          {description}
        </Typography>
      )}
    </div>
  );
}
