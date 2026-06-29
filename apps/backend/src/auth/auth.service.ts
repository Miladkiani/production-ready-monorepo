// apps/backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { AccountLockoutService } from './account-lockout.service';
import { CaptchaService } from './captcha.service';
import { SecuritySettingsService } from '../security-settings/security-settings.service';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  role?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly lockoutService: AccountLockoutService,
    private readonly captchaService: CaptchaService,
    private readonly securitySettingsService: SecuritySettingsService,
  ) {}

  async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(userId: string, role: string, email: string) {
    return this.jwtService.sign(
      { sub: userId, role, email },
      { expiresIn: '15m' }, // short-lived
    );
  }

  generateRefreshToken(userId: string) {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // long-lived
      },
    );
  }

  /** Hash refresh token before storing */
  async hashToken(token: string) {
    return bcrypt.hash(token, 12);
  }

  async verifyAccessToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException('Invalid or expired token');

      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /** Login user: validate credentials and return tokens */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
    captchaToken?: string,
  ): Promise<Tokens> {
    const normalizedEmail = email.toLowerCase();

    // SECURITY LAYER 1: Verify CAPTCHA (if enabled)
    let captchaScore: number | undefined;
    let captchaAction: string | undefined;

    if (this.captchaService.isEnabled()) {
      const captchaResult = await this.captchaService.verify(
        captchaToken,
        'login',
      );

      captchaScore = captchaResult.score;
      captchaAction = captchaResult.action;

      if (!captchaResult.success) {
        this.logger.warn(
          `CAPTCHA verification failed for ${normalizedEmail}: ${captchaResult.error}`,
        );

        // Record failed attempt with CAPTCHA data
        await this.lockoutService.recordLoginAttempt(
          normalizedEmail,
          false,
          ipAddress,
          userAgent,
          captchaScore,
          captchaAction,
        );

        throw new UnauthorizedException(
          'CAPTCHA verification failed. Please try again.',
        );
      }

      this.logger.log(
        `CAPTCHA verification successful for ${normalizedEmail}: score=${captchaScore}`,
      );
    }

    // SECURITY LAYER 2: Check if account is locked
    const lockoutStatus =
      await this.lockoutService.isAccountLocked(normalizedEmail);
    if (lockoutStatus.locked) {
      throw new UnauthorizedException(
        `Account temporarily locked due to too many failed login attempts. Please try again in ${lockoutStatus.remainingTime} minute(s).`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Record failed attempt
      await this.lockoutService.recordLoginAttempt(
        normalizedEmail,
        false,
        ipAddress,
        userAgent,
        captchaScore,
        captchaAction,
      );

      // Send Telegram notification (fire-and-forget)
      void this.securitySettingsService.sendLoginNotification({
        siteName: 'My Career Portfolio',
        success: false,
        email: normalizedEmail,
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) {
      // Record failed attempt
      await this.lockoutService.recordLoginAttempt(
        normalizedEmail,
        false,
        ipAddress,
        userAgent,
        captchaScore,
        captchaAction,
      );

      // Send Telegram notification (fire-and-forget)
      void this.securitySettingsService.sendLoginNotification({
        siteName: 'My Career Portfolio',
        success: false,
        email: normalizedEmail,
        ipAddress,
        userAgent,
      });

      // Check remaining attempts
      const remaining =
        await this.lockoutService.getRemainingAttempts(normalizedEmail);
      if (remaining > 0) {
        throw new UnauthorizedException(
          `Invalid credentials. ${remaining} attempt(s) remaining before account lockout.`,
        );
      } else {
        throw new UnauthorizedException(
          'Invalid credentials. Account has been temporarily locked due to too many failed attempts.',
        );
      }
    }

    // Successful login - record and clear failed attempts
    await this.lockoutService.recordLoginAttempt(
      normalizedEmail,
      true,
      ipAddress,
      userAgent,
      captchaScore,
      captchaAction,
    );
    await this.lockoutService.clearFailedAttempts(normalizedEmail);

    // Send Telegram notification (fire-and-forget)
    void this.securitySettingsService.sendLoginNotification({
      siteName: 'My Career Portfolio',
      success: true,
      email: normalizedEmail,
      ipAddress,
      userAgent,
    });

    const accessToken = this.generateAccessToken(
      user.id,
      user.role,
      user.email,
    );
    const refreshToken = this.generateRefreshToken(user.id);

    // Store hashed refresh token in DB
    const hashedRefreshToken = await this.hashToken(refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { currentHashedRefreshToken: hashedRefreshToken },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token
   *
   * @param userId - User ID from decoded refresh token
   * @param refreshToken - The refresh token to validate
   * @param rotateToken - Whether to rotate the refresh token (default: true)
   *                      Set to false for server-to-server calls (middleware)
   *                      to allow caching and reduce backend load
   */
  async refresh(userId: string, refreshToken: string, rotateToken = true) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.currentHashedRefreshToken)
      throw new UnauthorizedException('Invalid refresh token');

    const valid = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    // Generate new access token (always)
    const newAccessToken = this.generateAccessToken(
      user.id,
      user.role,
      user.email,
    );

    // Optionally rotate refresh token (for browser clients)
    let newRefreshToken = refreshToken; // Reuse existing token by default

    if (rotateToken) {
      newRefreshToken = this.generateRefreshToken(user.id);

      // Update database with new hashed refresh token
      const hashedRefreshToken = await this.hashToken(newRefreshToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { currentHashedRefreshToken: hashedRefreshToken },
      });
    }

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /** Logout user: invalidate refresh token */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentHashedRefreshToken: null },
    });
  }
}
