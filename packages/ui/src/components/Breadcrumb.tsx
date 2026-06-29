import React from "react";
import { cn } from "../functions";
import { Icon } from "./Icon";

export type BreadcrumbItem = {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
};

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode; // Allows arrow, chevron, slash or custom
  className?: string;
  "aria-label"?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  // Logical icon flips with RTL (uses currentColor)
  separator = <Icon name="ChevronRight" size={18} color="text-muted" />,
  className,
  "aria-label": ariaLabel = "Breadcrumb",
}) => {
  const count = items.length;
  return (
    <nav aria-label={ariaLabel} className={cn("w-full", className)}>
      <ol className="flex flex-wrap items-center gap-x-0 text-sm">
        {items.map((item, i) => {
          const isLast = i === count - 1;
          return (
            <li className="flex items-center shrink-0" key={i}>
              {!isLast && (
                <>
                  {item.href ? (
                    <a
                      href={item.href}
                      onClick={item.onClick}
                      className="text-muted hover:text-primary focus:text-primary transition underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary px-1 py-0.5 rounded"
                      tabIndex={0}
                    >
                      {item.icon && (
                        <span className="me-1 inline-block">{item.icon}</span>
                      )}
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-muted px-1 py-0.5">
                      {item.icon && (
                        <span className="me-1 inline-block">{item.icon}</span>
                      )}
                      {item.label}
                    </span>
                  )}
                  <span aria-hidden="true" className="inline-flex">
                    {separator}
                  </span>
                </>
              )}
              {isLast && (
                <span
                  aria-current="page"
                  className="text-primary font-medium px-1 py-0.5"
                  tabIndex={-1}
                >
                  {item.icon && (
                    <span className="me-1 inline-block">{item.icon}</span>
                  )}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
