import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import 'dotenv/config';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: () => {
        const adapter = new PrismaBetterSqlite3({
          url: process.env.DATABASE_URL || 'file:./dev.db',
        });

        const prisma = new PrismaClient({
          adapter,
          log: ['warn', 'error'],
        });
        return prisma;
      },
    },
  ],
  exports: [PrismaClient],
})
export class PrismaModule {}
