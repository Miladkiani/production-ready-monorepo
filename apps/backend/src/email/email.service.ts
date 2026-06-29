import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { EmailConfigService } from './email.config';
import type { ContactNotificationData } from './email.types';
// Template function is imported dynamically to avoid circular dependency issues
import * as templateModule from './templates/contact-message.template';

export type { ContactNotificationData };

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly configService: EmailConfigService;

  constructor() {
    this.configService = new EmailConfigService();
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    if (!this.configService.isConfigured()) {
      this.logger.warn(
        'Email configuration is incomplete. Email notifications will be disabled.',
      );
      return;
    }

    const config = this.configService.getConfig();

    try {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.auth.user,
          pass: config.auth.pass,
        },
      });

      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error);
      this.transporter = null;
    }
  }

  /**
   * Send contact form notification to admin
   */
  async sendContactNotification(
    data: ContactNotificationData,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(
        'Email transporter not configured. Skipping notification.',
      );
      return false;
    }

    const config = this.configService.getConfig();

    try {
      const html: string = templateModule.contactMessageTemplate(data);

      await this.transporter.sendMail({
        from: `"${config.from.name}" <${config.from.email}>`,
        to: config.adminEmail,
        subject: `New Contact Message from ${data.name}`,
        html,
        text: this.generatePlainText(data),
      });

      this.logger.log(
        `Contact notification email sent for message ${data.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Failed to send contact notification email', error);
      return false;
    }
  }

  /**
   * Generate plain text version of email
   */
  private generatePlainText(data: ContactNotificationData): string {
    return `
New Contact Message

From: ${data.name}
Email: ${data.email}
Date: ${data.submittedAt.toLocaleString()}
Message ID: ${data.messageId}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ''}

Message:
${data.message}

---
Reply directly to ${data.email} to respond.
    `.trim();
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Email connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Email connection test failed', error);
      return false;
    }
  }
}
