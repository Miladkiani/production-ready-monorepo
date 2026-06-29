import * as LucideIcons from "lucide-react";

/**
 * Check if a string is a valid URL
 */
export const isValidUrl = (str: string | undefined | null): boolean => {
  if (!str) return false;
  return str.startsWith("http://") || str.startsWith("https://");
};

/**
 * Check if an icon name is valid for the Icon component
 */
export const isValidIconName = (name: string | undefined | null): boolean => {
  if (!name) return false;
  return (
    name in LucideIcons &&
    typeof LucideIcons[name as keyof typeof LucideIcons] === "function"
  );
};
