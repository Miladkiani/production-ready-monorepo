import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesService } from './file.service';
import { FilesController } from './file.controller';
import { UploadController } from './upload.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [FilesController, UploadController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
