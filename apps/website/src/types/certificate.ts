import type { GetCertificatesPreviewQuery } from "@repo/graphql";

/**
 * Certificate item from GraphQL query (using lightweight preview query)
 */
export type CertificateItem =
  GetCertificatesPreviewQuery["certificates"][number];

/**
 * Transformed certificate data for display
 */
export interface CertificateCardData {
  id: string;
  title: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string | null;
  credentialUrl?: string | null;
  certificatePdfUrl?: string | null;
  certificateImageUrl?: string | null;
  logoUrl?: string | null;
  skills: string[];
  hasExpired: boolean;
  formattedIssueDate: string;
  formattedExpirationDate?: string;
}

/**
 * Transform GraphQL certificate data for display
 */
export function transformCertificateForCard(
  cert: CertificateItem,
): CertificateCardData {
  const issueDate = new Date(cert.issueDate);
  const expirationDate = cert.expirationDate
    ? new Date(cert.expirationDate)
    : null;
  const now = new Date();

  return {
    id: cert.id,
    title: cert.title,
    issuingOrganization: cert.issuingOrganization,
    issueDate: cert.issueDate,
    expirationDate: cert.expirationDate,
    credentialUrl: cert.credentialUrl,
    certificatePdfUrl: cert.certificatePdfUrl,
    certificateImageUrl: cert.certificateImageUrl,
    logoUrl: cert.logoUrl,
    skills: cert.skills,
    hasExpired: expirationDate ? expirationDate < now : false,
    formattedIssueDate: issueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    }),
    formattedExpirationDate: expirationDate
      ? expirationDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      : undefined,
  };
}

/**
 * Process and sort certificates for display
 * Note: Preview query only returns visible certificates
 */
export function processCertificates(
  certificates: CertificateItem[],
): CertificateCardData[] {
  return certificates
    .filter((cert) => cert.isVisible)
    .map(transformCertificateForCard);
}
