import { Injectable } from '@nestjs/common';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
  adminEmail: string;
}

@Injectable()
export class EmailConfigService {
  getConfig(): EmailConfig {
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      from: {
        name: process.env.SMTP_FROM_NAME || 'Portfolio Contact',
        email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '',
      },
      adminEmail: process.env.ADMIN_EMAIL || process.env.SMTP_USER || '',
    };
  }

  isConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(
      config.host && config.auth.user && config.auth.pass && config.adminEmail,
    );
  }
}
