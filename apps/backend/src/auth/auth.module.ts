// apps/backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthRestController } from './auth-rest.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './role.guard';
import { AccountLockoutService } from './account-lockout.service';
import { CaptchaService } from './captcha.service';
import { SecuritySettingsModule } from '../security-settings/security-settings.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    ConfigModule,
    SecuritySettingsModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    PrismaService,
    JwtAuthGuard,
    RolesGuard,
    AccountLockoutService,
    CaptchaService,
  ],
  controllers: [AuthRestController],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
