import type { ArticlesQuery } from "@repo/graphql";

// Extract article type from GraphQL query
export type ArticleListItem = ArticlesQuery["articles"][number];

// Transform article data for card component
export function transformArticleForCard(article: ArticleListItem) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    thumbnailUrl: article.thumbnailUrl || undefined,
    tags: article.tags.map((tag) => tag.name),
    excerpt: article.excerpt || undefined,
    // For external articles, link directly to the external URL
    // For internal articles, link to the internal article page
    link:
      article.isExternal && article.externalUrl
        ? article.externalUrl
        : `/articles/${article.slug}`,
    publishedAt: article.publishedAt || undefined,
    // Use the actual readingTime from database (calculated when article is saved)
    readingTime: article.readingTime || undefined,
    viewCount: article.viewCount,
    uniqueViewCount: article.uniqueViewCount,
    isExternal: article.isExternal,
  };
}
