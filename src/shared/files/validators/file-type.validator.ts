import { FileValidator } from '@nestjs/common';
import { Express } from 'express';

export interface FileTypeValidatorOptions {
  allowedMimeTypes: string[];
}

export class FileTypeValidator extends FileValidator<FileTypeValidatorOptions> {
  constructor(options: FileTypeValidatorOptions) {
    super(options);
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!this.validationOptions || !file) {
      return true;
    }
    return this.validationOptions.allowedMimeTypes.includes(file.mimetype);
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `Invalid file type: ${file.mimetype}. Allowed types are: ${this.validationOptions.allowedMimeTypes.join(', ')}.`;
  }
}
