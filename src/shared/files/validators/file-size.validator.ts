import { FileValidator } from '@nestjs/common';
import { Express } from 'express';

export interface FileSizeValidatorOptions {
    maxSize: number; // in bytes
}

export class FileSizeValidator extends FileValidator<FileSizeValidatorOptions> {
    constructor(options: FileSizeValidatorOptions) {
        super(options);
    }

    isValid(file?: Express.Multer.File): boolean {
        if (!this.validationOptions || !file) {
            return true;
        }
        return file.size <= this.validationOptions.maxSize;
    }

    buildErrorMessage(file: Express.Multer.File): string {
        const sizeInMB = (this.validationOptions.maxSize / (1024 * 1024)).toFixed(2);
        return `File size exceeds the allowed limit of ${sizeInMB} MB. Current file size: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`;
    }
}
