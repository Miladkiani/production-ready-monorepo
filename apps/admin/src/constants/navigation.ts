import { ADMIN_ROUTES } from "./routes";

export const NAV_ITEMS = [
  {
    href: ADMIN_ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: "LayoutDashboard",
  },
  { href: ADMIN_ROUTES.CONTACT, label: "Contact", icon: "MessageSquare" },
  { href: ADMIN_ROUTES.USERS, label: "Users", icon: "Users" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
