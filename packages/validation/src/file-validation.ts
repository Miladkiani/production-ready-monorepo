import { z } from "zod";

/**
 * File Validation Utilities
 * Client-side file validation for uploads
 */

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_PDF_TYPE = ["application/pdf"] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  THUMBNAIL: 2 * 1024 * 1024, // 2MB
  ICON: 2 * 1024 * 1024, // 2MB
  PDF: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Helper function to format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Validate image file
 */
export const imageFileSchema = (maxSize: number = FILE_SIZE_LIMITS.IMAGE) =>
  z
    .instanceof(File, { message: "Please select a file" })
    .refine((file) => file.size > 0, "File is empty")
    .refine(
      (file) => file.size <= maxSize,
      `File size must be less than ${formatFileSize(maxSize)}`,
    )
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type as any),
      `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map((t) => t.split("/")[1]).join(", ")}`,
    );

/**
 * Validate PDF file
 */
export const pdfFileSchema = (maxSize: number = FILE_SIZE_LIMITS.PDF) =>
  z
    .instanceof(File, { message: "Please select a PDF file" })
    .refine((file) => file.size > 0, "File is empty")
    .refine(
      (file) => file.size <= maxSize,
      `File size must be less than ${formatFileSize(maxSize)}`,
    )
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed",
    );

/**
 * Validate optional image file
 */
export const optionalImageFileSchema = (
  maxSize: number = FILE_SIZE_LIMITS.IMAGE,
) =>
  z
    .instanceof(File)
    .refine((file) => file.size > 0, "File is empty")
    .refine(
      (file) => file.size <= maxSize,
      `File size must be less than ${formatFileSize(maxSize)}`,
    )
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type as any),
      `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map((t) => t.split("/")[1]).join(", ")}`,
    )
    .optional();

/**
 * Validate optional PDF file
 */
export const optionalPdfFileSchema = (maxSize: number = FILE_SIZE_LIMITS.PDF) =>
  z
    .instanceof(File)
    .refine((file) => file.size > 0, "File is empty")
    .refine(
      (file) => file.size <= maxSize,
      `File size must be less than ${formatFileSize(maxSize)}`,
    )
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed",
    )
    .optional();

/**
 * Validate avatar image (smaller size limit)
 */
export const avatarFileSchema = imageFileSchema(FILE_SIZE_LIMITS.AVATAR);

/**
 * Validate thumbnail image (smaller size limit)
 */
export const thumbnailFileSchema = imageFileSchema(FILE_SIZE_LIMITS.THUMBNAIL);

/**
 * Validate icon/logo image (smaller size limit)
 */
export const iconFileSchema = imageFileSchema(FILE_SIZE_LIMITS.ICON);

/**
 * Validate multiple image files
 */
export const multipleImageFilesSchema = (
  minFiles: number = 1,
  maxFiles: number = 10,
  maxSize: number = FILE_SIZE_LIMITS.IMAGE,
) =>
  z
    .array(
      z
        .instanceof(File)
        .refine((file) => file.size > 0, "File is empty")
        .refine(
          (file) => file.size <= maxSize,
          `File size must be less than ${formatFileSize(maxSize)}`,
        )
        .refine(
          (file) => ALLOWED_IMAGE_TYPES.includes(file.type as any),
          `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map((t) => t.split("/")[1]).join(", ")}`,
        ),
    )
    .min(
      minFiles,
      `At least ${minFiles} file${minFiles > 1 ? "s" : ""} required`,
    )
    .max(maxFiles, `Maximum ${maxFiles} files allowed`);

/**
 * Validate file extension matches MIME type
 */
export const validateFileExtension = (file: File): boolean => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  const validExtensions: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/gif": ["gif"],
    "application/pdf": ["pdf"],
  };

  const allowedExtensions = validExtensions[mimeType];
  return allowedExtensions
    ? allowedExtensions.includes(extension || "")
    : false;
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(file.type as any);
};

/**
 * Check if file is a PDF
 */
export const isPdfFile = (file: File): boolean => {
  return file.type === "application/pdf";
};

/**
 * Get image dimensions from File
 */
export const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error("File is not an image"));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = async (
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number,
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const { width, height } = await getImageDimensions(file);

    if (minWidth && width < minWidth) {
      return {
        valid: false,
        error: `Image width must be at least ${minWidth}px (current: ${width}px)`,
      };
    }

    if (minHeight && height < minHeight) {
      return {
        valid: false,
        error: `Image height must be at least ${minHeight}px (current: ${height}px)`,
      };
    }

    if (maxWidth && width > maxWidth) {
      return {
        valid: false,
        error: `Image width must be at most ${maxWidth}px (current: ${width}px)`,
      };
    }

    if (maxHeight && height > maxHeight) {
      return {
        valid: false,
        error: `Image height must be at most ${maxHeight}px (current: ${height}px)`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error ? error.message : "Failed to validate image",
    };
  }
};

/**
 * Type exports
 */
export type ImageFile = z.infer<ReturnType<typeof imageFileSchema>>;
export type PdfFile = z.infer<ReturnType<typeof pdfFileSchema>>;
export type AvatarFile = z.infer<typeof avatarFileSchema>;
export type ThumbnailFile = z.infer<typeof thumbnailFileSchema>;
export type IconFile = z.infer<typeof iconFileSchema>;
