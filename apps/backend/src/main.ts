import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get CORS origins from environment (comma-separated)
  const corsOriginEnv = configService.get<string>('CORS_ORIGIN', '');
  const adminUrl = configService.get<string>(
    'ADMIN_URL',
    'http://localhost:3000',
  );
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3002',
  );

  // Parse comma-separated CORS origins and filter out empty strings
  const corsOrigins = corsOriginEnv
    ? corsOriginEnv
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [adminUrl, frontendUrl].filter(Boolean);

  // CORS configuration for both admin panel and website
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(cookieParser());

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
  console.log(`📁 REST API: http://localhost:${port}/api/upload`);
  console.log(`🌍 Environment: ${nodeEnv}`);
  console.log(`🔐 CORS enabled for: ${corsOrigins.join(', ')}`);
}
bootstrap();
