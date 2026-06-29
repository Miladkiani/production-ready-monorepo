import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { SKIP_RATE_LIMIT_KEY } from '../decorators/skip-throttle.decorator';

/**
 * Custom ThrottlerGuard for GraphQL and REST APIs
 * Extracts IP address from both GraphQL and HTTP contexts for rate limiting
 * Respects @SkipRateLimit decorator for public read-only queries
 *
 * IMPORTANT: This guard is applied globally (APP_GUARD) and handles:
 * - GraphQL queries/mutations
 * - REST API endpoints
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  constructor(
    protected override readonly options: ThrottlerModuleOptions,
    protected override readonly storageService: ThrottlerStorage,
    protected override readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  /**
   * Check if rate limiting should be skipped for this handler
   */
  protected override async shouldSkip(
    context: ExecutionContext,
  ): Promise<boolean> {
    // Check for @SkipRateLimit decorator
    const skipRateLimit = this.reflector.getAllAndOverride<boolean>(
      SKIP_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipRateLimit) {
      return true;
    }

    return super.shouldSkip(context);
  }

  /**
   * Get request from GraphQL or REST context
   * Handles both GraphQL queries/mutations and REST API calls
   */
  override getRequestResponse(context: ExecutionContext) {
    // Check if this is a GraphQL context
    if (context.getType<string>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      return { req: ctx.req, res: ctx.res };
    }

    // Otherwise it's a REST/HTTP context
    return {
      req: context.switchToHttp().getRequest(),
      res: context.switchToHttp().getResponse(),
    };
  }

  /**
   * Extract IP address for tracking rate limits
   * Supports X-Forwarded-For header for proxied requests (nginx)
   */
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    // Type guard for request with headers and socket
    const hasHeaders = (
      r: unknown,
    ): r is { headers: Record<string, unknown> } =>
      typeof r === 'object' && r !== null && 'headers' in r;
    const hasSocket = (
      r: unknown,
    ): r is { socket: { remoteAddress?: string } } =>
      typeof r === 'object' && r !== null && 'socket' in r;

    // Get IP from X-Forwarded-For header (set by nginx) or socket
    let ip = 'unknown';

    if (hasHeaders(req)) {
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') {
        ip = forwarded.split(',')[0]?.trim() ?? 'unknown';
      } else if (Array.isArray(forwarded) && forwarded.length > 0) {
        ip = String(forwarded[0]).trim();
      }
    }

    // Fallback to socket remote address
    if (ip === 'unknown' && hasSocket(req)) {
      ip = req.socket.remoteAddress ?? 'unknown';
    }

    return Promise.resolve(ip);
  }

  /**
   * Handle rate limit exceeded
   * Returns user-friendly error message
   */
  protected override async throwThrottlingException(): Promise<void> {
    return Promise.reject(
      new Error('Too many requests from this IP. Please try again later.'),
    );
  }
}
