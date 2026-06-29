import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSecuritySettingsInput } from './dto/update-security-settings.input';

/**
 * Login Notification Data
 * Contains information to be sent to Telegram
 */
export interface LoginNotificationData {
  siteName: string;
  success: boolean;
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Security Settings Service
 * Manages security configuration and Telegram notifications
 *
 * Features:
 * - Get/update security settings (Telegram bot token, chat ID)
 * - Fire-and-forget Telegram notifications for login attempts
 * - Automatic error logging for failed notifications
 * - Non-blocking: auth flow continues regardless of notification status
 */
@Injectable()
export class SecuritySettingsService {
  private readonly logger = new Logger(SecuritySettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get security settings
   * @returns Security settings entity or null if not configured
   */
  async getSecuritySettings() {
    return this.prisma.securitySettings.findFirst({
      where: { id: 'security-settings' },
    });
  }

  /**
   * Update security settings
   * Uses upsert pattern for single-record model
   * @param input - Updated security settings data
   * @returns Updated security settings entity
   */
  async updateSecuritySettings(input: UpdateSecuritySettingsInput) {
    // Handle null/empty values - clear settings if both are empty
    const shouldClearSettings =
      (!input.telegramBotToken || input.telegramBotToken.trim() === '') &&
      (!input.telegramChatId || input.telegramChatId.trim() === '');

    return this.prisma.securitySettings.upsert({
      where: { id: 'security-settings' },
      update: {
        telegramBotToken: shouldClearSettings
          ? null
          : (input.telegramBotToken?.trim() ?? null),
        telegramChatId: shouldClearSettings
          ? null
          : (input.telegramChatId?.trim() ?? null),
      },
      create: {
        id: 'security-settings',
        telegramBotToken: shouldClearSettings
          ? null
          : (input.telegramBotToken?.trim() ?? null),
        telegramChatId: shouldClearSettings
          ? null
          : (input.telegramChatId?.trim() ?? null),
      },
    });
  }

  /**
   * Send login notification to Telegram (fire-and-forget)
   * Non-blocking: returns immediately, notification sent in background
   * Errors are logged but don't affect the auth flow
   *
   * @param data - Login notification data
   */
  async sendLoginNotification(data: LoginNotificationData): Promise<void> {
    // Fire-and-forget: don't await, just log errors
    await this.sendTelegramMessage(data).catch((error) => {
      this.logger.error(
        `Failed to send Telegram notification for ${data.email}`,
        error.stack,
      );
    });
  }

  /**
   * Internal method: Send message to Telegram API
   * Formats message and makes HTTP request
   * @param data - Login notification data
   */
  private async sendTelegramMessage(
    data: LoginNotificationData,
  ): Promise<void> {
    // Get security settings
    const settings = await this.getSecuritySettings();

    // Skip if Telegram not configured
    if (!settings?.telegramBotToken || !settings.telegramChatId) {
      this.logger.debug('Telegram notifications not configured, skipping');
      return;
    }

    // Parse user agent for device info
    const deviceInfo = this.parseUserAgent(data.userAgent);

    // Format message
    const status = data.success ? 'Success ✅' : 'Failed ❌';
    const message = [
      `🔐 <b>${data.siteName}</b>`,
      `Admin Login`,
      `<b>${status}</b>`,
      ``,
      `📧 <b>Email:</b> <code>${data.email}</code>`,
      `🌐 <b>IP:</b> <code>${data.ipAddress ?? 'Unknown'}</code>`,
      `📱 <b>Device:</b> ${deviceInfo}`,
      ``,
      `🕐 <i>${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC</i>`,
    ].join('\n');

    // Send to Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;

    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as {
        description?: string;
      };
      throw new Error(
        `Telegram API error: ${errorData.description ?? response.statusText}`,
      );
    }

    this.logger.debug(`Telegram notification sent for ${data.email}`);
  }

  /**
   * Parse user agent string to extract device info
   * Simple extraction: browser and OS
   * @param userAgent - User agent string from request
   * @returns Formatted device info string
   */
  private parseUserAgent(userAgent?: string): string {
    if (!userAgent) {
      return 'Unknown Device';
    }

    // Simple extraction patterns
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) {
      os = 'iOS';
    }

    return `${browser} on ${os}`;
  }
}
