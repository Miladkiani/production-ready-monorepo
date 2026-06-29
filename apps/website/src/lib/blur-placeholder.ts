/**
 * Generate a simple blur placeholder data URL
 * This creates a tiny colored rectangle that serves as a blur placeholder
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = "#1a1a1a",
): string {
  // Create a simple SVG with a solid color
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `;

  // Encode to base64
  const base64 = Buffer.from(svg).toString("base64");

  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get a blur placeholder for article images
 */
export function getArticleImageBlur(): string {
  // Use a dark gray color matching our theme
  return generateBlurDataURL(10, 10, "#18181b");
}

/**
 * Get a blur placeholder for certificate/logo images
 */
export function getCertificateImageBlur(): string {
  // Use a lighter color for certificate images
  return generateBlurDataURL(10, 10, "#27272a");
}

/**
 * Get a blur placeholder for resume preview images
 */
export function getResumeImageBlur(): string {
  // Use a medium gray for resume previews
  return generateBlurDataURL(10, 10, "#3f3f46");
}
