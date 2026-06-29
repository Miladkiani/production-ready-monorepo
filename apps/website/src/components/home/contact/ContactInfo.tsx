import { Icon, Typography, type IconName } from "@repo/ui";

export interface ContactInfoItem {
  icon: IconName;
  label: string;
  value: string;
  href?: string; // Optional link (for email: mailto:, phone: tel:)
}

interface ContactInfoProps {
  items?: ContactInfoItem[];
  title?: string;
}

export function ContactInfo({
  items = [],
  title = "Contact Information",
}: ContactInfoProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Typography variant="h5" weight="semibold" color="text-primary">
        {title}
      </Typography>

      <div className="space-y-4">
        {items.map((item, index) => {
          const Content = (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-surface/50 border border-card hover:border-accent/50 transition-colors group">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Icon name={item.icon} size={20} color="accent" />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <Typography
                  variant="caption"
                  color="muted"
                  className="uppercase tracking-wide font-medium mb-1"
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body"
                  color="text-primary"
                  className="break-words"
                >
                  {item.value}
                </Typography>
              </div>
            </div>
          );

          // Wrap in link if href is provided
          if (item.href) {
            return (
              <a
                key={index}
                href={item.href}
                className="block hover:scale-[1.02] transition-transform"
                aria-label={`${item.label}: ${item.value}`}
              >
                {Content}
              </a>
            );
          }

          return <div key={index}>{Content}</div>;
        })}
      </div>
    </div>
  );
}
