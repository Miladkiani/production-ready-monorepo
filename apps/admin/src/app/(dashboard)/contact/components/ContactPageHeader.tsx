import { Card, Icon, Typography } from "@repo/ui";
import { type ContactMessageStatisticsQuery } from "@repo/graphql";

interface ContactPageHeaderProps {
  statistics: ContactMessageStatisticsQuery["contactMessageStatistics"];
}

export const ContactPageHeader: React.FC<ContactPageHeaderProps> = ({
  statistics,
}) => {
  const stats = [
    {
      label: "Total Messages",
      value: statistics.total,
      icon: "MessageSquare" as const,
      bgGradient: "from-primary/10 to-primary/5",
      iconColor: "primary" as const,
    },
    {
      label: "New",
      value: statistics.new,
      icon: "Mail" as const,
      bgGradient: "from-primary/10 to-primary/5",
      iconColor: "primary" as const,
    },
    {
      label: "Read",
      value: statistics.read,
      icon: "MailOpen" as const,
      bgGradient: "from-warning/10 to-warning/5",
      iconColor: "secondary" as const,
    },
    {
      label: "Replied",
      value: statistics.replied,
      icon: "CheckCircle" as const,
      bgGradient: "from-success/10 to-success/5",
      iconColor: "success" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h3" weight="bold" color="text">
            Contact Messages
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Manage and respond to contact form submissions
          </Typography>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            variant="outline"
            elevation={1}
            rounded="lg"
            className={`!p-6 bg-gradient-to-br ${stat.bgGradient}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface/80 flex items-center justify-center shadow-sm">
                <Icon name={stat.icon} size={24} color={stat.iconColor} />
              </div>
              <div className="flex-1">
                <Typography variant="h4" weight="bold" color="text">
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="muted">
                  {stat.label}
                </Typography>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
