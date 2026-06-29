import type { SocialsListQuery } from "@repo/graphql";

/**
 * Social link item extracted from GraphQL query
 */
export type SocialListItem = SocialsListQuery["socials"][number];

/**
 * Social link data for Contact component
 */
export interface SocialLinkData {
  title: string;
  link: string;
  icon: string;
  order: number;
}

/**
 * Transform GraphQL social data to Contact component format
 * Filters out socials without required fields and sorts by order
 */
export function transformSocialForContact(
  social: SocialListItem,
): SocialLinkData | null {
  if (!social.link || !social.title) {
    return null;
  }

  const iconName = social.icon || social.title;

  return {
    title: social.title,
    link: social.link,
    icon: iconName,
    order: social.order,
  };
}

/**
 * Process and sort social links for display
 */
export function processSocialLinks(
  socials: SocialsListQuery["socials"],
): SocialLinkData[] {
  return socials
    .map(transformSocialForContact)
    .filter((social): social is SocialLinkData => social !== null)
    .sort((a, b) => a.order - b.order);
}
