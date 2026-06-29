import { z } from "zod";
import {
  imageFileSchema,
  pdfFileSchema,
  avatarFileSchema,
  thumbnailFileSchema,
  iconFileSchema,
  multipleImageFilesSchema,
  FILE_SIZE_LIMITS,
} from "./file-validation";

/**
 * Schema for deleting a file by URL
 */
export const deleteFileSchema = z.object({
  url: z.url("Invalid URL format"),
});

/**
 * Avatar upload schema
 */
export const uploadAvatarSchema = z.object({
  file: avatarFileSchema,
});

/**
 * Resume PDF upload schema
 */
export const uploadResumeSchema = z.object({
  file: pdfFileSchema(FILE_SIZE_LIMITS.PDF),
});

/**
 * Article image upload schema
 */
export const uploadArticleImageSchema = z.object({
  file: imageFileSchema(FILE_SIZE_LIMITS.IMAGE),
});

/**
 * Thumbnail upload schema
 */
export const uploadThumbnailSchema = z.object({
  file: thumbnailFileSchema,
});

/**
 * Social icon/logo upload schema
 */
export const uploadSocialIconSchema = z.object({
  file: iconFileSchema,
});

/**
 * Publisher logo upload schema
 */
export const uploadPublisherLogoSchema = z.object({
  file: iconFileSchema,
});

/**
 * Certificate image upload schema
 */
export const uploadCertificateImageSchema = z.object({
  file: imageFileSchema(FILE_SIZE_LIMITS.IMAGE),
});

/**
 * Certificate PDF upload schema
 */
export const uploadCertificatePdfSchema = z.object({
  file: pdfFileSchema(FILE_SIZE_LIMITS.PDF),
});

/**
 * Resume page images upload schema (multiple files)
 */
export const uploadResumePageImagesSchema = z.object({
  files: multipleImageFilesSchema(1, 3, FILE_SIZE_LIMITS.IMAGE),
});

/**
 * Type exports
 */
export type DeleteFileInput = z.infer<typeof deleteFileSchema>;
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;
export type UploadResumeInput = z.infer<typeof uploadResumeSchema>;
export type UploadArticleImageInput = z.infer<typeof uploadArticleImageSchema>;
export type UploadThumbnailInput = z.infer<typeof uploadThumbnailSchema>;
export type UploadSocialIconInput = z.infer<typeof uploadSocialIconSchema>;
export type UploadPublisherLogoInput = z.infer<
  typeof uploadPublisherLogoSchema
>;
export type UploadCertificateImageInput = z.infer<
  typeof uploadCertificateImageSchema
>;
export type UploadCertificatePdfInput = z.infer<
  typeof uploadCertificatePdfSchema
>;
export type UploadResumePageImagesInput = z.infer<
  typeof uploadResumePageImagesSchema
>;
