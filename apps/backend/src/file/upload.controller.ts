import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Throttle } from '@nestjs/throttler';
import { FilesService } from './file.service';
import { JwtAuthGuard } from '@backend/auth/jwt-auth.guard';

/**
 * Response type for single file upload
 */
interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

/**
 * Response type for multiple file upload
 */
interface MultiUploadResponse {
  urls: string[];
  filenames: string[];
  totalSize: number;
}

/**
 * Create multer disk storage configuration for a specific bucket
 * This ensures files are written to disk so we can validate them with magic bytes
 */
const createDiskStorage = (bucket: string) =>
  diskStorage({
    destination: (req, file, cb) => {
      try {
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
  });

/**
 * REST API Controller for file uploads
 * Handles all file upload operations (avatar, resume, images, etc.)
 *
 * Routes:
 * - Development: Admin POST /api/upload/avatar → Next.js rewrites → POST localhost:4000/upload/avatar
 * - Production: Admin POST /api/upload/avatar → Nginx rewrites → POST backend:3001/upload/avatar
 *
 * Note: Both Next.js and nginx remove the /api prefix before proxying to backend
 */
@Controller('upload')
export class UploadController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Shared validation and save logic for file uploads
   * Uses magic bytes validation to prevent MIME spoofing
   * @private
   */
  private async validateAndSave(
    file: Express.Multer.File,
    allowedTypes: Array<'image' | 'pdf'>,
    maxSizeMB: number,
    bucket: string,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxSizeMB}MB limit`);
    }

    // CRITICAL: Validate file using magic bytes (prevents MIME spoofing)
    await this.filesService.validateFileWithMagicBytes(file.path, allowedTypes);

    // Save file and return URL
    return this.filesService.saveMulterFile(file, bucket);
  }

  /**
   * Shared validation and save logic for multiple file uploads
   * Uses magic bytes validation to prevent MIME spoofing
   * @private
   */
  private async validateAndSaveMultiple(
    files: Express.Multer.File[],
    allowedTypes: Array<'image' | 'pdf'>,
    maxSizeMB: number,
    bucket: string,
  ): Promise<MultiUploadResponse> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    const results: UploadResponse[] = [];
    let totalSize = 0;

    for (const file of files) {
      // Validate file size
      if (file.size > maxSize) {
        throw new BadRequestException(
          `File size exceeds ${maxSizeMB}MB limit: ${file.originalname}`,
        );
      }

      // CRITICAL: Validate file using magic bytes (prevents MIME spoofing)
      await this.filesService.validateFileWithMagicBytes(
        file.path,
        allowedTypes,
      );

      // Save file
      const result = this.filesService.saveMulterFile(file, bucket);
      results.push(result);
      totalSize += result.size;
    }

    return {
      urls: results.map((r) => r.url),
      filenames: results.map((r) => r.filename),
      totalSize,
    };
  }

  /**
   * Upload profile avatar image
   * POST /api/upload/avatar
   * @param file - Image file (jpg, png, gif, webp)
   * @returns Upload response with URL
   *
   * SECURITY: Rate limited to prevent abuse
   */
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @Throttle({
    short: { limit: 5, ttl: 1000 },
    medium: { limit: 20, ttl: 60000 },
  }) // 5 uploads/sec, 20/min
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createDiskStorage('avatars'),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponse> {
    return this.validateAndSave(file, ['image'], 5, 'avatars');
  }

  /**
   * Delete uploaded file
   * DELETE /api/upload/file
   * @param body - Object containing the file URL to delete
   * @returns Success status
   */
  @Delete('file')
  @UseGuards(JwtAuthGuard)
  deleteFile(@Body() body: { url: string }): { success: boolean } {
    if (!body.url) {
      throw new BadRequestException('URL is required');
    }

    // Extract relative path from URL
    const urlObj = new URL(body.url);
    const relPath = urlObj.pathname.replace('/uploads/', '');

    // Delete file
    const success = this.filesService.deleteFile(relPath);

    if (!success) {
      throw new BadRequestException('Failed to delete file');
    }

    return { success: true };
  }
}
