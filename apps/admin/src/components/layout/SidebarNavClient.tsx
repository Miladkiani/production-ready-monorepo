"use client";

import { cn, Icon, type IconName } from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavClientProps {
  items: Array<{
    href: string;
    label: string;
    icon: string;
  }>;
}

/**
 * Client component for sidebar navigation with active state tracking.
 * Separated from server rendering to minimize client-side JavaScript.
 */
export function SidebarNavClient({ items }: SidebarNavClientProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for dashboard to avoid matching all routes starting with "/"
    if (href === "/") {
      return pathname === "/";
    }
    // For other routes, check if pathname starts with the href
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {items.map(({ href, label, icon }) => {
        const active = isActive(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              active
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted hover:text-text hover:bg-surface-hover active:scale-[0.98]",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              name={icon as IconName}
              size={20}
              className={cn(
                "transition-transform duration-200",
                active ? "scale-110 text-white" : "group-hover:scale-110",
              )}
              aria-hidden="true"
            />
            <span className="flex-1">{label}</span>
            {active && (
              <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            )}
          </Link>
        );
      })}
    </>
  );
}
