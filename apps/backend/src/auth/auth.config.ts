import { ConfigService } from '@nestjs/config';

export interface AuthConfig {
  refreshTokenMaxAge: number;
  cookiePath: string;
  cookieSecure: boolean;
  cookieSameSite: 'strict' | 'lax' | 'none';
  cookieDomain?: string;
}

export const getAuthConfig = (configService: ConfigService): AuthConfig => ({
  refreshTokenMaxAge: configService.get<number>(
    'REFRESH_TOKEN_MAX_AGE',
    7 * 24 * 60 * 60 * 1000, // 7 days default
  ),
  cookiePath: '/',
  // In production, cookies must be secure (HTTPS only)
  cookieSecure:
    configService.get<string>('COOKIE_SECURE') === 'true' ||
    configService.get<string>('NODE_ENV') === 'production',
  // SameSite configuration per environment
  cookieSameSite: (configService.get<string>('COOKIE_SAME_SITE') ||
    (configService.get<string>('NODE_ENV') === 'production'
      ? 'strict'
      : 'lax')) as 'strict' | 'lax' | 'none',
  // Optional: Set cookie domain for subdomains
  cookieDomain: configService.get<string>('COOKIE_DOMAIN'),
});
