import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageProvider, IUploadResult } from './storage.provider.interface';
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

  async upload(file: Express.Multer.File): Promise<IUploadResult> {
    // We can double check here asynchronously if needed
    const fullPath = this.resolveUploadDir();

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(fullPath, filename);

    await fsPromises.writeFile(filePath, file.buffer);

    return {
      key: filename,
      url: `/uploads/${filename}`,
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
