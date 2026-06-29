import { forwardRef, Module } from '@nestjs/common';
import { SecuritySettingsService } from './security-settings.service';
import { SecuritySettingsResolver } from './security-settings.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Security Settings Module
 * Provides security configuration management
 *
 * Features:
 * - Telegram notification configuration
 * - Login attempt notifications (fire-and-forget)
 * - Admin-only access control
 *
 * Exports:
 * - SecuritySettingsService (for use in AuthModule)
 *
 * Architecture Note:
 * - Uses forwardRef for AuthModule to break circular dependency
 * - PrismaService is provided directly (GraphMessenger pattern)
 */
@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [SecuritySettingsService, SecuritySettingsResolver, PrismaService],
  exports: [SecuritySettingsService],
})
export class SecuritySettingsModule {}
