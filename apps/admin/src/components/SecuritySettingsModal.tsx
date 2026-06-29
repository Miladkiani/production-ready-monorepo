"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateSecuritySettingsSchema,
  type UpdateSecuritySettings,
} from "@repo/validation";
import { Button, Input, Modal, Typography } from "@repo/ui";
import {
  getSecuritySettings,
  updateSecuritySettings,
} from "@admin/app/(dashboard)/security-settings-actions";

interface SecuritySettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Security Settings Modal Component
 *
 * Features:
 * - Optional Telegram bot token and chat ID configuration
 * - Fire-and-forget login notifications (success/failed)
 * - Dark mode support via CSS variables
 * - Accessible form with validation
 * - Both fields must be filled together or both empty
 * - Auto-fetches data when opened
 */
export function SecuritySettingsModal({
  open,
  onOpenChange,
}: SecuritySettingsModalProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateSecuritySettings>({
    resolver: zodResolver(UpdateSecuritySettingsSchema),
    defaultValues: {
      telegramBotToken: null,
      telegramChatId: null,
    },
  });

  // Fetch settings when modal opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      getSecuritySettings()
        .then(
          (
            settings:
              | {
                  telegramBotToken?: string | null;
                  telegramChatId?: string | null;
                }
              | null
              | undefined,
          ) => {
            reset({
              telegramBotToken: settings?.telegramBotToken ?? null,
              telegramChatId: settings?.telegramChatId ?? null,
            });
          },
        )
        .catch((err: Error) => {
          console.error("Failed to fetch settings:", err);
          setErrorMessage("Failed to load security settings");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, reset]);

  // Handle form submission
  const onSubmit = async (formData: UpdateSecuritySettings) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateSecuritySettings(formData);
      setSuccessMessage("Security settings updated successfully");
      setTimeout(() => {
        setSuccessMessage(null);
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to update security settings",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setSuccessMessage(null);
      setErrorMessage(null);
      onOpenChange(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Security Settings"
      size="lg"
      aria-label="Security settings configuration"
    >
      {isLoading ? (
        <div className="py-8 flex items-center justify-center">
          <Typography variant="body" color="muted">
            Loading settings...
          </Typography>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Typography variant="body" color="muted">
              Configure Telegram notifications for admin login attempts. Leave
              both fields empty to disable notifications.
            </Typography>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <Typography variant="body" color="success">
                {successMessage}
              </Typography>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-lg bg-error/10 border border-error/20">
              <Typography variant="body" color="error">
                {errorMessage}
              </Typography>
            </div>
          )}

          {/* Telegram Bot Token */}
          <div className="space-y-2">
            <label htmlFor="telegramBotToken" className="block">
              <Typography variant="body" weight="medium">
                Telegram Bot Token
                <Typography
                  variant="caption"
                  color="muted"
                  className="ml-2 font-normal"
                >
                  (Optional)
                </Typography>
              </Typography>
            </label>
            <Input
              id="telegramBotToken"
              type="text"
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              {...register("telegramBotToken")}
              error={errors.telegramBotToken?.message}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            {errors.telegramBotToken && (
              <Typography variant="caption" color="error">
                {errors.telegramBotToken.message}
              </Typography>
            )}
            <Typography variant="caption" color="muted">
              Get your bot token from{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @BotFather
              </a>{" "}
              on Telegram
            </Typography>
          </div>

          {/* Telegram Chat ID */}
          <div className="space-y-2">
            <label htmlFor="telegramChatId" className="block">
              <Typography variant="body" weight="medium">
                Telegram Chat ID
                <Typography
                  variant="caption"
                  color="muted"
                  className="ml-2 font-normal"
                >
                  (Optional)
                </Typography>
              </Typography>
            </label>
            <Input
              id="telegramChatId"
              type="text"
              placeholder="-1001234567890 or 123456789"
              {...register("telegramChatId")}
              error={errors.telegramChatId?.message}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            {errors.telegramChatId && (
              <Typography variant="caption" color="error">
                {errors.telegramChatId.message}
              </Typography>
            )}
            <Typography variant="caption" color="muted">
              Use{" "}
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @userinfobot
              </a>{" "}
              to get your chat ID (can be negative for groups/channels)
            </Typography>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-surface-secondary border border-border space-y-2">
            <Typography
              variant="body"
              weight="medium"
              className="flex items-center gap-2"
            >
              <span>ℹ️</span>
              How it works
            </Typography>
            <Typography variant="caption" color="muted" className="space-y-1">
              <div>
                • Login notifications are sent in real-time (fire-and-forget)
              </div>
              <div>
                • Authentication completes regardless of notification status
              </div>
              <div>• Includes IP address, device info, and timestamp</div>
              <div>• Both fields must be filled together or both empty</div>
            </Typography>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
