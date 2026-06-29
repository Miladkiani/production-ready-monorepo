// apps/backend/src/auth/auth.resolver.ts
import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';

import { Request, Response } from 'express';
import { LoginResponse, LoginInput } from './entities/auth.entities';
import { ConfigService } from '@nestjs/config';
import { getAuthConfig, AuthConfig } from './auth.config';

@Resolver()
export class AuthResolver {
  private readonly authConfig: AuthConfig;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.authConfig = getAuthConfig(this.configService);
  }

  /**
   * Login mutation
   * Returns access token in response
   * Sets refresh token as HttpOnly cookie
   *
   * SECURITY: Strict rate limiting (5 attempts per minute)
   * Protects against brute force attacks
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  @Mutation(() => LoginResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context('req') req: Request,
    @Context('res') res: Response,
  ) {
    // Extract IP and User-Agent for security tracking
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const { accessToken, refreshToken } = await this.authService.login(
      input.email,
      input.password,
      ipAddress,
      userAgent,
      input.captchaToken,
    );

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.authConfig.cookieSecure,
      sameSite: this.authConfig.cookieSameSite,
      path: this.authConfig.cookiePath,
      maxAge: this.authConfig.refreshTokenMaxAge,
      ...(this.authConfig.cookieDomain && {
        domain: this.authConfig.cookieDomain,
      }),
    });

    return { accessToken };
  }

  /**
   * Refresh mutation
   * Reads refresh token from cookie, issues new access token
   * Optionally rotates refresh token
   */
  @Mutation(() => LoginResponse)
  async refresh(@Context('req') req: Request, @Context('res') res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new Error('No refresh token found');

    // Decode user ID from token or via JWT payload
    const { sub: userId } =
      await this.authService.verifyRefreshToken(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(userId, refreshToken);

    // Rotate refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: this.authConfig.cookieSecure,
      sameSite: this.authConfig.cookieSameSite,
      path: this.authConfig.cookiePath,
      maxAge: this.authConfig.refreshTokenMaxAge,
      ...(this.authConfig.cookieDomain && {
        domain: this.authConfig.cookieDomain,
      }),
    });

    return { accessToken };
  }

  /**
   * Logout mutation
   * Deletes refresh token in DB and clears cookies
   */
  @Mutation(() => Boolean)
  async logout(@Context('req') req: Request, @Context('res') res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) {
      const { sub: userId } =
        await this.authService.verifyRefreshToken(refreshToken);
      await this.authService.logout(userId);
    }

    // Clear refreshToken cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.authConfig.cookieSecure,
      sameSite: this.authConfig.cookieSameSite,
      path: this.authConfig.cookiePath,
      ...(this.authConfig.cookieDomain && {
        domain: this.authConfig.cookieDomain,
      }),
    });

    // Clear accessToken cookie (set by admin middleware)
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.authConfig.cookieSecure,
      sameSite: this.authConfig.cookieSameSite,
      path: this.authConfig.cookiePath,
      ...(this.authConfig.cookieDomain && {
        domain: this.authConfig.cookieDomain,
      }),
    });

    return true;
  }
}
