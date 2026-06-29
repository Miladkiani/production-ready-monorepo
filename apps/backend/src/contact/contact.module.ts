import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactResolver } from './contact.resolver';
import { ContactService } from './contact.service';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '@backend/auth/auth.module';

@Module({
  imports: [EmailModule, AuthModule],
  providers: [ContactResolver, ContactService, PrismaService],
  exports: [ContactService],
})
export class ContactModule {}
