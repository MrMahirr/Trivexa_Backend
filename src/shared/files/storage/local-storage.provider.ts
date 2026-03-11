import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageProvider, IUploadResult, UploadOptions } from './storage.provider.interface';
import { promises as fsPromises, existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalFileProvider implements IStorageProvider, OnModuleInit {
  private readonly logger = new Logger(LocalFileProvider.name);
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('storage.local.uploadDir') || './uploads';
  }

  onModuleInit() {
    this.ensureUploadDir();
  }

  private resolveUploadDir(): string {
    return path.isAbsolute(this.uploadDir)
      ? this.uploadDir
      : path.resolve(process.cwd(), this.uploadDir);
  }

  private ensureUploadDir() {
    const fullPath = this.resolveUploadDir();
    this.logger.log(`[DEBUG] Checking upload dir: ${fullPath}`);
    try {
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
        this.logger.log(`Created upload directory: ${fullPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${error.message}`);
      // Don't throw, just log. Tests might fail later but we see why.
    }
  }

  private sanitizeFolderPath(value?: string): string[] {
    if (!value) return [];
    return value
      .split(/[\\/]+/)
      .map((segment) => segment.trim().toLowerCase().replace(/[^a-z0-9-_]/g, ''))
      .filter((segment) => segment.length > 0);
  }

  async upload(file: Express.Multer.File, options?: UploadOptions): Promise<IUploadResult> {
    // We can double check here asynchronously if needed
    const fullPath = this.resolveUploadDir();
    const folderSegments = this.sanitizeFolderPath(options?.folderPath);
    const targetDir = path.join(fullPath, ...folderSegments);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(targetDir, filename);

    await fsPromises.writeFile(filePath, file.buffer);

    const urlPath = folderSegments.length > 0
      ? path.posix.join('/uploads', ...folderSegments, filename)
      : `/uploads/${filename}`;

    return {
      key: filename,
      url: urlPath,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.resolveUploadDir(), key);
    try {
      await fsPromises.unlink(filePath);
    } catch (error) {
      this.logger.warn(`Failed to delete file ${key}: ${error.message}`);
    }
  }
}
