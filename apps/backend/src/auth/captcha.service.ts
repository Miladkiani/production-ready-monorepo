import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getCaptchaConfig, CaptchaConfig } from './captcha.config';

/**
 * Google reCAPTCHA v3 API Response Interface
 * @see https://developers.google.com/recaptcha/docs/verify
 */
interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

/**
 * CAPTCHA Verification Result
 */
export interface CaptchaVerificationResult {
  success: boolean;
  score: number;
  action?: string;
  error?: string;
}

/**
 * CAPTCHA Service
 * Handles Google reCAPTCHA v3 verification with security best practices
 *
 * Security Features:
 * - Server-side verification only (never trust client)
 * - Graceful degradation (log errors but don't block legitimate users)
 * - Development bypass for faster iteration
 * - Timeout protection against slow API responses
 * - Comprehensive error handling and logging
 */
@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly config: CaptchaConfig;

  constructor(configService: ConfigService) {
    this.config = getCaptchaConfig(configService);

    if (!this.config.enabled) {
      this.logger.warn(
        '🔓 CAPTCHA verification is DISABLED (development mode or missing configuration)',
      );
    } else {
      this.logger.log(
        `🛡️  CAPTCHA verification ENABLED (threshold: ${this.config.scoreThreshold})`,
      );
    }
  }

  /**
   * Verify reCAPTCHA v3 token
   *
   * @param token - The reCAPTCHA token from client
   * @param expectedAction - Expected action (e.g., 'login') for additional security
   * @returns Verification result with score
   *
   * @throws Never throws - implements graceful degradation for security
   */
  async verify(
    token: string | undefined,
    expectedAction = 'login',
  ): Promise<CaptchaVerificationResult> {
    // Development bypass - CAPTCHA disabled
    if (!this.config.enabled) {
      this.logger.debug('CAPTCHA bypassed (disabled in configuration)');
      return {
        success: true,
        score: 1.0,
        action: expectedAction,
      };
    }

    // Missing token when CAPTCHA is enabled
    if (!token || token.trim().length === 0) {
      this.logger.warn('CAPTCHA verification failed: Missing token');
      return {
        success: false,
        score: 0.0,
        error: 'CAPTCHA token is required',
      };
    }

    try {
      // Call Google reCAPTCHA API with timeout protection
      const response = await this.verifyWithGoogle(token);

      // Log verification result for monitoring
      this.logger.debug(
        `CAPTCHA verification: success=${response.success}, score=${response.score}, action=${response.action}`,
      );

      // Validate action matches expected (prevents token reuse across actions)
      if (response.action !== expectedAction) {
        this.logger.warn(
          `CAPTCHA action mismatch: expected="${expectedAction}", got="${response.action}"`,
        );
        return {
          success: false,
          score: response.score,
          action: response.action,
          error: 'Invalid CAPTCHA action',
        };
      }

      // Check if score meets threshold
      const meetsThreshold = response.score >= this.config.scoreThreshold;

      if (!meetsThreshold) {
        this.logger.warn(
          `CAPTCHA score below threshold: ${response.score} < ${this.config.scoreThreshold}`,
        );
      }

      return {
        success: response.success && meetsThreshold,
        score: response.score,
        action: response.action,
        error: meetsThreshold ? undefined : 'CAPTCHA score too low',
      };
    } catch (error) {
      // Graceful degradation: Log error but allow login
      // This prevents CAPTCHA service outages from blocking all logins
      this.logger.error(
        `CAPTCHA verification error (graceful degradation): ${error instanceof Error ? error.message : String(error)}`,
      );

      // In production, you might want to alert on repeated failures
      // indicating potential CAPTCHA service issues
      return {
        success: true, // Allow login despite CAPTCHA failure
        score: 0.5, // Neutral score
        error: 'CAPTCHA service unavailable',
      };
    }
  }

  /**
   * Call Google reCAPTCHA verification API
   * @private
   */
  private async verifyWithGoogle(token: string): Promise<RecaptchaResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const params = new URLSearchParams({
        secret: this.config.secretKey,
        response: token,
      });

      const response = await fetch(this.config.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `reCAPTCHA API returned ${response.status}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as RecaptchaResponse;

      if (!data.success && data['error-codes']?.length) {
        this.logger.warn(
          `reCAPTCHA API errors: ${data['error-codes'].join(', ')}`,
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          `reCAPTCHA verification timeout (>${this.config.timeout}ms)`,
        );
      }

      throw error;
    }
  }

  /**
   * Check if CAPTCHA is enabled
   * Useful for conditional logic in other services
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get current score threshold
   * Useful for client-side messaging
   */
  getScoreThreshold(): number {
    return this.config.scoreThreshold;
  }
}
