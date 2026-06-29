import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { FilesService } from './file.service';
import { JwtAuthGuard } from '@backend/auth/jwt-auth.guard';

export type Bucket = 'avatars';

@Controller('upload')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          try {
            const bucket = (req.query.bucket as Bucket) ?? 'misc';
            // Use environment variable directly in static context
            const baseDir = process.env.UPLOAD_DIR || 'uploads';
            const dir = join(process.cwd(), baseDir, bucket);
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
            cb(null, dir);
          } catch (err) {
            cb(err instanceof Error ? err : new Error(String(err)), 'null');
          }
        },
        filename: (req, file, cb) => {
          const { originalname } = file;
          const name = `${Date.now()}-${originalname.replace(/\s+/g, '-')}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('bucket') bucket: Bucket = 'avatars',
  ) {
    // Validate file types based on bucket
    if (['avatars'].includes(bucket)) {
      this.files.validateFileWithMagicBytes(file.mimetype, ['image']);
    }

    const relPath = `${bucket}/${file.filename}`;
    const url = this.files.publicUrl(relPath);

    return { url, path: relPath, size: file.size, mime: file.mimetype };
  }
}
