// apps/backend/src/files/file-replace.service.ts
import { Injectable } from '@nestjs/common';
import { FilesService } from './file.service';
import { Bucket } from './file.controller';

@Injectable()
export class FileReplaceService {
  constructor(private readonly files: FilesService) {}

  /**
   * Handles replacing an existing file with a new upload.
   * @param params
   */
  async replaceFileAndUpdate<T>(params: {
    bucket: Bucket;
    upload: {
      createReadStream: () => NodeJS.ReadableStream;
      filename: string;
      mimetype: string;
    };
    validate: Array<'image' | 'pdf'>;
    existingUrl?: string | null;
    onSuccess: (url: string) => Promise<T>;
  }): Promise<T> {
    const { bucket, upload, validate, existingUrl, onSuccess } = params;

    const { createReadStream, filename, mimetype } = upload;

    // 1) Validate
    this.files.validateFile(mimetype, validate);

    // 2) Save new file
    const stream = createReadStream();
    const { relPath, url } = await this.files.saveFilesStream(
      stream,
      filename,
      bucket,
    );

    try {
      // 3) Update DB (with new url)
      const result = await onSuccess(url);

      // 4) Delete old file if any
      if (existingUrl) {
        const rel = existingUrl.split('/uploads/')[1];
        if (rel) this.files.deleteFile(rel);
      }

      return result;
    } catch (err) {
      // Rollback on failure
      this.files.deleteFile(relPath);
      throw err;
    }
  }

  /**
   * Handles replacing multiple existing files with new uploads.
   * @param params
   */
  async replaceMultipleFilesAndUpdate<T>(params: {
    bucket: Bucket;
    uploads: Array<{
      createReadStream: () => NodeJS.ReadableStream;
      filename: string;
      mimetype: string;
    }>;
    validate: Array<'image' | 'pdf'>;
    existingUrls?: Array<string | null>;
    onSuccess: (urls: string[]) => Promise<T>;
  }): Promise<T> {
    const { bucket, uploads, validate, existingUrls = [], onSuccess } = params;

    // Track new files to clean up on failure
    const newFiles: string[] = [];

    try {
      // 1) Process all uploads
      const uploadPromises = uploads.map(async (upload) => {
        const { createReadStream, filename, mimetype } = upload;

        // Validate each file
        this.files.validateFile(mimetype, validate);

        // Save new file
        const stream = createReadStream();
        const { relPath, url } = await this.files.saveFilesStream(
          stream,
          filename,
          bucket,
        );

        // Track for cleanup if needed
        newFiles.push(relPath);

        return url;
      });

      // Wait for all uploads to complete
      const urls = await Promise.all(uploadPromises);

      // 2) Update DB with all new urls
      const result = await onSuccess(urls);

      // 3) Delete old files if any
      existingUrls.forEach((existingUrl) => {
        if (existingUrl) {
          const rel = existingUrl.split('/uploads/')[1];
          if (rel) this.files.deleteFile(rel);
        }
      });

      return result;
    } catch (err) {
      // Rollback on failure - delete any new files that were uploaded
      newFiles.forEach((relPath) => {
        this.files.deleteFile(relPath);
      });
      throw err;
    }
  }
}
