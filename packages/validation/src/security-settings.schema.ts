import { z } from "zod";
import { safeText } from "./text-validation";

/**
 * Security Settings Update Schema
 * Validates security configuration updates for admin panel
 *
 * Features:
 * - Optional Telegram bot token and chat ID
 * - XSS protection on all text fields
 * - Both fields must be provided together or both empty
 *
 * Validation Rules:
 * 1. If telegramBotToken is provided, telegramChatId must also be provided
 * 2. If telegramChatId is provided, telegramBotToken must also be provided
 * 3. Bot token format: should start with a number followed by a colon
 * 4. Chat ID format: can be negative (for groups/channels) or positive (for users)
 */
export const UpdateSecuritySettingsSchema = z
  .object({
    telegramBotToken: safeText("Telegram bot token")
      .pipe(
        z
          .string()
          .min(40, "Telegram bot token must be at least 40 characters")
          .max(100, "Telegram bot token must be under 100 characters")
          .regex(/^\d+:[A-Za-z0-9_-]+$/, "Invalid Telegram bot token format"),
      )
      .optional()
      .nullable(),
    telegramChatId: safeText("Telegram chat ID")
      .pipe(
        z
          .string()
          .min(1, "Telegram chat ID is required")
          .max(50, "Telegram chat ID must be under 50 characters")
          .regex(
            /^-?\d+$/,
            "Telegram chat ID must be a number (can be negative for groups)",
          ),
      )
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    // Both fields must be provided together or both empty
    const hasToken = data.telegramBotToken?.trim();
    const hasChatId = data.telegramChatId?.trim();

    if (hasToken && !hasChatId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telegram chat ID is required when bot token is provided",
        path: ["telegramChatId"],
      });
    }

    if (hasChatId && !hasToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telegram bot token is required when chat ID is provided",
        path: ["telegramBotToken"],
      });
    }
  });

export type UpdateSecuritySettings = z.infer<
  typeof UpdateSecuritySettingsSchema
>;
