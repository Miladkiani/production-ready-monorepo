"use server";

import { revalidatePath } from "next/cache";
import {
  UpdateSecuritySettingsSchema,
  type UpdateSecuritySettings,
} from "@repo/validation";
import { executeServerGraphQL } from "@admin/lib/clients/graphql-server";
import {
  SecuritySettingsDocument,
  UpdateSecuritySettingsDocument,
} from "@repo/graphql";

interface SecuritySettings {
  id: string;
  telegramBotToken: string | null;
  telegramChatId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Server action to fetch security settings
 */
export async function getSecuritySettings() {
  try {
    const response = (await executeServerGraphQL(
      {
        query: SecuritySettingsDocument,
        variables: {},
      },
      { cache: "no-store" },
    )) as { securitySettings: SecuritySettings | null };

    return response.securitySettings;
  } catch (error) {
    console.error("Error fetching security settings:", error);
    throw new Error("Failed to fetch security settings");
  }
}

/**
 * Server action to update security settings
 * @param data - Security settings data (validated with Zod)
 */
export async function updateSecuritySettings(data: UpdateSecuritySettings) {
  // Validate input
  const validatedData = UpdateSecuritySettingsSchema.parse(data);

  try {
    await executeServerGraphQL(
      {
        query: UpdateSecuritySettingsDocument,
        variables: {
          input: {
            telegramBotToken: validatedData.telegramBotToken,
            telegramChatId: validatedData.telegramChatId,
          },
        },
      },
      { cache: "no-store" },
    );

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating security settings:", error);
    throw new Error("Failed to update security settings");
  }
}
