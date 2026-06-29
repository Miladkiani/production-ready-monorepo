import { Card, Typography } from "@repo/ui";

export default async function DashboardPage() {
  const stats = [
    {
      title: "Contact Messages",
      value: "—",
      description: "Total received",
      icon: "MessageSquare",
    },
    {
      title: "New Messages",
      value: "—",
      description: "Awaiting review",
      icon: "Mail",
    },
    {
      title: "Replied",
      value: "—",
      description: "Messages replied",
      icon: "CheckCircle",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your application activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <header className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Typography className="text-sm font-medium">
                {stat.title}
              </Typography>
            </header>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4">
          <Typography className="text-sm font-medium mb-2">
            Quick Links
          </Typography>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              →{" "}
              <a
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Manage Contact Messages
              </a>
            </li>
            <li>
              →{" "}
              <a href="/users" className="hover:text-primary transition-colors">
                Manage Users
              </a>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
