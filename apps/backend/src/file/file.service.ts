import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  existsSync,
  mkdirSync,
  unlinkSync,
  renameSync,
  readFileSync,
} from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { writeStreamToFile } from './file.util';
import { Bucket } from './file.controller';

@Injectable()
export class FilesService {
  private baseDir: string;

  constructor(private configService: ConfigService) {
    this.baseDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
  }

  ensureDir(sub: string) {
    const dir = join(process.cwd(), this.baseDir, sub);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  makeFilename(originalName: string) {
    const ext = extname(originalName).toLowerCase();
    const id = randomUUID();
    return `${id}${ext}`;
  }

  publicUrl(relPath: string) {
    // Return relative URL for admin to use with proxy
    // In development: /api/uploads/... → proxied by Next.js to localhost:4000/uploads/...
    // In production: /api/uploads/... → proxied by nginx to backend/uploads/...
    return `/api/uploads/${relPath.replace(/\\/g, '/')}`;
  }

  /**
   * @deprecated Use validateFileWithMagicBytes for secure validation
   */
  validateFile(mime: string, allow: Array<'image' | 'pdf'>) {
    const isImg = mime.startsWith('image/');
    const isPdf = mime === 'application/pdf';
    if (allow.includes('image') && isImg) return;
    if (allow.includes('pdf') && isPdf) return;
    throw new BadRequestException('Invalid file type');
  }

  /**
   * Secure file validation using magic bytes (file signature)
   * Prevents MIME type spoofing attacks
   *
   * @param filePath - Absolute path to uploaded file
   * @param allowedTypes - Array of allowed file types
   * @throws BadRequestException if file type is not allowed
   */
  async validateFileWithMagicBytes(
    filePath: string,
    allowedTypes: Array<'image' | 'pdf'>,
  ): Promise<void> {
    try {
      // Read file buffer for magic bytes detection
      const buffer = readFileSync(filePath, { encoding: null });
      const fileType = await fileTypeFromBuffer(buffer);

      if (!fileType) {
        throw new BadRequestException(
          'Cannot determine file type. File may be corrupted or unsupported.',
        );
      }

      // Define allowed MIME types and extensions
      const allowedMimes: string[] = [];
      const allowedExtensions: string[] = [];

      if (allowedTypes.includes('image')) {
        allowedMimes.push(
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'image/bmp',
          'image/tiff',
        );
        allowedExtensions.push(
          'jpg',
          'jpeg',
          'png',
          'gif',
          'webp',
          'svg',
          'bmp',
          'tiff',
          'tif',
        );
      }

      if (allowedTypes.includes('pdf')) {
        allowedMimes.push('application/pdf');
        allowedExtensions.push('pdf');
      }

      // Check MIME type from magic bytes
      if (!allowedMimes.includes(fileType.mime)) {
        throw new BadRequestException(
          `Invalid file type: ${fileType.mime}. Allowed types: ${allowedMimes.join(', ')}`,
        );
      }

      // Check extension matches MIME type
      if (!allowedExtensions.includes(fileType.ext)) {
        throw new BadRequestException(
          `Invalid file extension: ${fileType.ext}. File content does not match extension.`,
        );
      }

      // Additional security: Check for executable content in SVG images only
      // Binary images (JPEG, PNG, etc.) can have random byte sequences that trigger false positives
      // SVG is text-based XML and can contain malicious scripts
      if ((fileType.mime as string) === 'image/svg+xml') {
        this.scanForMaliciousContent(buffer);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Scan file buffer for malicious content patterns
   * Detects common exploit signatures
   */
  private scanForMaliciousContent(buffer: Buffer): void {
    const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000));

    // Check for PHP code
    if (content.includes('<?php') || content.includes('<?=')) {
      throw new BadRequestException(
        'Malicious content detected: PHP code found in file',
      );
    }

    // Check for script tags (XSS in SVG)
    if (content.toLowerCase().includes('<script')) {
      throw new BadRequestException(
        'Malicious content detected: Script tags found in file',
      );
    }

    // Check for eval/exec patterns
    if (
      content.includes('eval(') ||
      content.includes('exec(') ||
      content.includes('system(')
    ) {
      throw new BadRequestException(
        'Malicious content detected: Dangerous function calls found',
      );
    }

    // Check for common webshell signatures
    const webshellPatterns = [
      'c99',
      'r57',
      'b374k',
      'shell_exec',
      'passthru',
      'proc_open',
    ];

    for (const pattern of webshellPatterns) {
      if (content.toLowerCase().includes(pattern)) {
        throw new BadRequestException(
          `Malicious content detected: Webshell signature found (${pattern})`,
        );
      }
    }
  }

  deleteFile(relPath: string) {
    try {
      const abs = join(process.cwd(), this.baseDir, relPath);
      if (existsSync(abs)) unlinkSync(abs);
      return true;
    } catch {
      return false;
    }
  }

  async saveFilesStream(
    readStream: NodeJS.ReadableStream,
    originalName: string,
    bucket: Bucket = 'avatars',
  ) {
    const dir = this.ensureDir(bucket);
    const filename = this.makeFilename(originalName);
    const relPath = `${bucket}/${filename}`;
    const absPath = join(dir, filename);

    await writeStreamToFile(readStream, absPath);

    return { relPath, url: this.publicUrl(relPath) };
  }

  /**
   * Save uploaded file from Multer (REST API)
   * @param file - Multer uploaded file (already saved to disk via diskStorage)
   * @param bucket - Destination folder (avatars, resume, etc.)
   * @returns Object with url, filename, and size
   *
   * NOTE: When using diskStorage in FileInterceptor, file.path already points
   * to the final location. We just need to return the URL without moving.
   */
  saveMulterFile(
    file: Express.Multer.File,
    bucket: Bucket | string = 'avatars',
  ): { url: string; filename: string; size: number } {
    // With diskStorage, file is already saved to disk at file.path
    // file.filename contains the generated filename (from diskStorage config)
    const relPath = `${bucket}/${file.filename}`;

    return {
      url: this.publicUrl(relPath),
      filename: file.originalname,
      size: file.size,
    };
  }
}
