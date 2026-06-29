import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@backend/auth/jwt-auth.guard';
import { LoginDto, RefreshTokenDto } from './dto/auth-rest.dto';
import { Request } from 'express';
import type { JwtPayload } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthRestController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint for REST clients
   *
   * Note: This endpoint is primarily for testing or non-GraphQL clients.
   * The main admin app uses the GraphQL login mutation.
   *
   * SECURITY: Strict rate limiting - 5 attempts per minute per IP
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    // Extract IP and User-Agent for security tracking (optional for REST)
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req as any).socket?.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const tokens = await this.authService.login(
      dto.email,
      dto.password,
      ipAddress,
      userAgent,
    );

    // Get user info for response
    const user = await this.authService.verifyAccessToken(tokens.accessToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Refresh endpoint for server-side (middleware) token refresh
   *
   * ARCHITECTURE: This endpoint is specifically designed for Next.js middleware:
   * - Accepts refreshToken in request body (not cookie)
   * - Returns BOTH accessToken and refreshToken in response body
   * - Enables middleware to capture rotated tokens properly
   * - Server-to-server communication (secure over internal Docker network)
   *
   * Unlike the GraphQL refresh mutation which sets tokens in cookies,
   * this REST endpoint returns tokens in JSON for explicit control by middleware.
   *
   * SECURITY: Moderate rate limiting - 30 requests per minute per IP
   * (More permissive than login since middleware may call this frequently,
   *  but still prevents abuse)
   */
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token (for server-side use)' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    // Verify and decode refresh token to get userId
    const payload: JwtPayload = this.authService.verifyRefreshToken(
      dto.refreshToken,
    );

    // IMPORTANT: rotateToken=false for server-to-server (middleware) calls
    // This allows middleware to cache and only refresh when access token expires
    // Reduces backend load and prevents hitting rate limits on every request
    // Browser clients should use GraphQL endpoint which rotates tokens
    const tokens = await this.authService.refresh(
      payload.sub,
      dto.refreshToken,
      false, // Don't rotate refresh token for middleware
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'User logged out successfully' })
  async logout(@Req() req: Request & { user: { userId: string } }) {
    await this.authService.logout(req.user.userId);
  }
}
