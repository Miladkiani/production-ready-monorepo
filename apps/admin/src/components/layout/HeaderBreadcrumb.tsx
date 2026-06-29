"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem } from "@repo/ui";

export function HeaderBreadcrumb() {
  const pathname = usePathname(); // e.g. "/socials/edit/123"

  // Break route into segments
  const segments = pathname.split("/").filter(Boolean); // ["socials", "edit", "123"]

  // Build breadcrumb items
  const items: BreadcrumbItem[] = [
    {
      label: "Dashboard",
      href: "/",
    },
  ];

  // Map each segment to a breadcrumb item
  segments.forEach((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");

    // Capitalize + replace dashes
    const label = decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase());

    items.push({
      label,
      href,
    });
  });

  return <Breadcrumb items={items} aria-label="Page navigation" />;
}
