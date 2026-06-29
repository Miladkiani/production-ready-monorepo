import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SecuritySettingsService } from './security-settings.service';
import { SecuritySettingsEntity } from './entities/security-settings.entity';
import { UpdateSecuritySettingsInput } from './dto/update-security-settings.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { Role } from '@prisma/client';

/**
 * Security Settings Resolver
 * GraphQL API for security configuration management
 *
 * Features:
 * - Get current security settings
 * - Update Telegram notification configuration
 * - Admin-only access (protected by JWT + Role guards)
 */
@Resolver(() => SecuritySettingsEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class SecuritySettingsResolver {
  constructor(
    private readonly securitySettingsService: SecuritySettingsService,
  ) {}

  /**
   * Get security settings
   * Returns current configuration or null if not set
   */
  @Query(() => SecuritySettingsEntity, { nullable: true })
  @Roles(Role.ADMIN)
  async securitySettings() {
    return this.securitySettingsService.getSecuritySettings();
  }

  /**
   * Update security settings
   * Upserts security configuration
   * @param input - Telegram bot token and chat ID
   */
  @Mutation(() => SecuritySettingsEntity)
  @Roles(Role.ADMIN)
  async updateSecuritySettings(
    @Args('input') input: UpdateSecuritySettingsInput,
  ) {
    return this.securitySettingsService.updateSecuritySettings(input);
  }
}
