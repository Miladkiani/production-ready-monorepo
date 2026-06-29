import { ConfigService } from '@nestjs/config';

/**
 * Configuration for environment variables
 * Provides typed access and validation
 */
export class EnvironmentConfig {
  constructor(private configService: ConfigService) {}

  // Database
  get databaseUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  // JWT
  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET', this.jwtSecret);
  }

  get refreshTokenMaxAge(): number {
    return this.configService.get<number>(
      'REFRESH_TOKEN_MAX_AGE',
      7 * 24 * 60 * 60 * 1000, // 7 days
    );
  }

  // Account Security
  get maxLoginAttempts(): number {
    return this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
  }

  get lockoutDurationMinutes(): number {
    return this.configService.get<number>('LOCKOUT_DURATION_MINUTES', 15);
  }

  // Cookies
  get cookieSecure(): boolean {
    return (
      this.configService.get<string>('COOKIE_SECURE') === 'true' ||
      this.nodeEnv === 'production'
    );
  }

  get cookieSameSite(): 'strict' | 'lax' | 'none' {
    const value = this.configService.get<string>('COOKIE_SAME_SITE');
    if (value === 'strict' || value === 'lax' || value === 'none') {
      return value;
    }
    return this.nodeEnv === 'production' ? 'strict' : 'lax';
  }

  get cookieDomain(): string | undefined {
    return this.configService.get<string>('COOKIE_DOMAIN');
  }

  // CORS
  get corsOrigins(): string[] {
    const corsOrigin = this.configService.get<string>(
      'CORS_ORIGIN',
      'http://localhost:3001',
    );
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    return [corsOrigin, frontendUrl].filter(Boolean);
  }

  // File Upload
  get maxFileSize(): number {
    return this.configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
  }

  get uploadDir(): string {
    return this.configService.get<string>('UPLOAD_DIR', './uploads');
  }

  get publicBaseUrl(): string {
    return this.configService.get<string>(
      'PUBLIC_BASE_URL',
      'http://localhost:4000',
    );
  }

  // Server
  get port(): number {
    return this.configService.get<number>('PORT', 4000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  // Seed Data
  get adminEmail(): string | undefined {
    return this.configService.get<string>('ADMIN_EMAIL');
  }

  get adminPassword(): string | undefined {
    return this.configService.get<string>('ADMIN_PASSWORD');
  }
}
