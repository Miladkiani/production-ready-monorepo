import { z } from "zod";
import { safeTextRefinement } from "./text-validation";

/**
 * Contact Message Status Enum
 */
export const ContactMessageStatusEnum = z.enum([
  "NEW",
  "READ",
  "REPLIED",
  "ARCHIVED",
  "SPAM",
]);

export type ContactMessageStatus = z.infer<typeof ContactMessageStatusEnum>;

/**
 * Schema for submitting a contact form (public)
 */
export const createContactMessageSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.email("Please provide a valid email address").trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters")
    .trim()
    .refine(
      safeTextRefinement,
      "Message contains potentially dangerous HTML tags",
    ),
});

export type CreateContactMessage = z.infer<typeof createContactMessageSchema>;

/**
 * Schema for updating contact message status (admin)
 */
export const updateContactMessageStatusSchema = z.object({
  id: z.cuid(),
  status: ContactMessageStatusEnum,
  adminNotes: z.string().max(1000).optional(),
});

export type UpdateContactMessageStatus = z.infer<
  typeof updateContactMessageStatusSchema
>;

/**
 * Schema for filtering contact messages (admin)
 */
export const contactMessagesFilterSchema = z.object({
  status: ContactMessageStatusEnum.optional(),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).max(100).optional(),
});

export type ContactMessagesFilter = z.infer<typeof contactMessagesFilterSchema>;
