import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountLockoutService {
  private readonly maxAttempts: number;
  private readonly lockoutDurationMinutes: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
    this.lockoutDurationMinutes = this.configService.get<number>(
      'LOCKOUT_DURATION_MINUTES',
      15,
    );
  }

  /**
   * Record a login attempt
   */
  async recordLoginAttempt(
    email: string,
    successful: boolean,
    ipAddress?: string,
    userAgent?: string,
    captchaScore?: number,
    captchaAction?: string,
  ): Promise<void> {
    await this.prisma.loginAttempt.create({
      data: {
        email: email.toLowerCase(),
        successful,
        ipAddress,
        userAgent,
        captchaScore,
        captchaAction,
      },
    });
  }

  /**
   * Check if an account is currently locked
   * Returns { locked: boolean, remainingTime?: number, attempts: number }
   */
  async isAccountLocked(email: string): Promise<{
    locked: boolean;
    remainingTime?: number;
    attempts: number;
  }> {
    const normalizedEmail = email.toLowerCase();
    const lockoutThreshold = new Date(
      Date.now() - this.lockoutDurationMinutes * 60 * 1000,
    );

    const recentFailedAttempts = await this.prisma.loginAttempt.findMany({
      where: {
        email: normalizedEmail,
        successful: false,
        createdAt: {
          gte: lockoutThreshold,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const failedCount = recentFailedAttempts.length;

    // Check if there was a successful login after the failed attempts
    if (recentFailedAttempts.length > 0) {
      const lastFailedAttempt = recentFailedAttempts[0];
      const successfulAttemptAfterFailed =
        await this.prisma.loginAttempt.findFirst({
          where: {
            email: normalizedEmail,
            successful: true,
            createdAt: {
              gt: lastFailedAttempt.createdAt,
            },
          },
        });

      // If there was a successful login after failures, account is not locked
      if (successfulAttemptAfterFailed) {
        return { locked: false, attempts: 0 };
      }
    }

    if (failedCount >= this.maxAttempts) {
      const oldestRelevantAttempt = recentFailedAttempts[failedCount - 1];
      const lockoutExpiry = new Date(
        oldestRelevantAttempt.createdAt.getTime() +
          this.lockoutDurationMinutes * 60 * 1000,
      );
      const remainingTime = Math.ceil(
        (lockoutExpiry.getTime() - Date.now()) / 1000 / 60,
      ); // in minutes

      return {
        locked: true,
        remainingTime: Math.max(remainingTime, 1),
        attempts: failedCount,
      };
    }

    return { locked: false, attempts: failedCount };
  }

  /**
   * Clear failed login attempts for an email (called after successful login)
   */
  async clearFailedAttempts(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();
    const lockoutThreshold = new Date(
      Date.now() - this.lockoutDurationMinutes * 60 * 1000,
    );

    // Delete recent failed attempts
    await this.prisma.loginAttempt.deleteMany({
      where: {
        email: normalizedEmail,
        successful: false,
        createdAt: {
          gte: lockoutThreshold,
        },
      },
    });
  }

  /**
   * Get remaining attempts before lockout
   */
  async getRemainingAttempts(email: string): Promise<number> {
    const lockoutStatus = await this.isAccountLocked(email);
    if (lockoutStatus.locked) {
      return 0;
    }
    return this.maxAttempts - lockoutStatus.attempts;
  }

  /**
   * Clean up old login attempts (run periodically)
   * Removes attempts older than 7 days
   */
  async cleanupOldAttempts(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.loginAttempt.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    return result.count;
  }
}
