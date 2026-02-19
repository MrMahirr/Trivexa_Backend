import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IStorageProvider, IUploadResult } from './storage.provider.interface';
import { promises as fsPromises, existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalFileProvider implements IStorageProvider, OnModuleInit {
    private readonly logger = new Logger(LocalFileProvider.name);
    private readonly uploadDir = 'uploads';

    constructor() { }

    onModuleInit() {
        this.ensureUploadDir();
    }

    private ensureUploadDir() {
        const fullPath = path.resolve(this.uploadDir);
        this.logger.log(`[DEBUG] Checking upload dir: ${fullPath}`);
        try {
            if (!existsSync(this.uploadDir)) {
                mkdirSync(this.uploadDir, { recursive: true });
                this.logger.log(`Created upload directory: ${this.uploadDir}`);
            }
        } catch (error) {
            this.logger.error(`Failed to create upload directory: ${error.message}`);
            // Don't throw, just log. Tests might fail later but we see why.
        }
    }

    async upload(file: Express.Multer.File): Promise<IUploadResult> {
        // We can double check here asynchronously if needed
        const fullPath = path.resolve(this.uploadDir);

        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        const filePath = path.join(this.uploadDir, filename);

        await fsPromises.writeFile(filePath, file.buffer);

        return {
            key: filename,
            url: `/uploads/${filename}`,
            size: file.size,
            mimeType: file.mimetype,
        };
    }

    async delete(key: string): Promise<void> {
        const filePath = path.join(this.uploadDir, key);
        try {
            await fsPromises.unlink(filePath);
        } catch (error) {
            this.logger.warn(`Failed to delete file ${key}: ${error.message}`);
        }
    }
}
