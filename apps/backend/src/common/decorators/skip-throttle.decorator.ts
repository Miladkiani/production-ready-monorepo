import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to skip rate limiting for specific endpoints
 * Use for public read-only queries that don't need rate limiting
 *
 * Example:
 * @SkipRateLimit()
 * @Query(() => AppInfo)
 * async appInfo() { ... }
 */
export const SKIP_RATE_LIMIT_KEY = 'skipRateLimit';
export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true);
