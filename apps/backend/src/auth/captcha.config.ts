import { ConfigService } from '@nestjs/config';

/**
 * CAPTCHA Configuration Interface
 * Provides typed configuration for Google reCAPTCHA v3
 */
export interface CaptchaConfig {
  /** Enable/disable CAPTCHA verification (false in development) */
  enabled: boolean;
  /** Google reCAPTCHA v3 secret key */
  secretKey: string;
  /** Minimum score threshold (0.0 to 1.0, recommended: 0.5) */
  scoreThreshold: number;
  /** Verification API timeout in milliseconds */
  timeout: number;
  /** Google reCAPTCHA verification endpoint */
  verifyUrl: string;
}

/**
 * Get CAPTCHA configuration from environment
 * Implements secure defaults and validation
 */
export const getCaptchaConfig = (
  configService: ConfigService,
): CaptchaConfig => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const secretKey = configService.get<string>('RECAPTCHA_SECRET_KEY', '');

  // Auto-disable CAPTCHA if:
  // 1. Explicitly disabled via CAPTCHA_ENABLED=false
  // 2. No secret key provided (development convenience)
  // 3. Running in test environment
  const explicitlyEnabled =
    configService.get<string>('CAPTCHA_ENABLED') === 'true';
  const hasSecretKey = secretKey.length > 0;
  const isTestEnv = nodeEnv === 'test';

  const enabled = explicitlyEnabled && hasSecretKey && !isTestEnv;

  return {
    enabled,
    secretKey,
    scoreThreshold: configService.get<number>('RECAPTCHA_V3_THRESHOLD', 0.5),
    timeout: configService.get<number>('RECAPTCHA_TIMEOUT', 5000),
    verifyUrl: 'https://www.google.com/recaptcha/api/siteverify',
  };
};
