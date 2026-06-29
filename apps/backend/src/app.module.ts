import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { FilesModule } from './file/file.module';

import { ContactModule } from './contact/contact.module';
import { EmailModule } from './email/email.module';
import { SecuritySettingsModule } from './security-settings/security-settings.module';
import { GqlThrottlerGuard } from './common/guards/graphql-throttler.guard';
import { Request, Response } from 'express';

interface GraphQLContext {
  req: Request;
  res: Response;
}

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second per IP (general GraphQL queries)
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute per IP
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour per IP
      },
    ]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      driver: ApolloDriver,
      csrfPrevention: false,
      context: ({ req, res }: GraphQLContext): GraphQLContext => ({ req, res }),
    }),
    EmailModule,
    FilesModule,
    ContactModule,
    AuthModule,
    SecuritySettingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard, // Apply rate limiting globally
    },
  ],
})
export class AppModule {}
