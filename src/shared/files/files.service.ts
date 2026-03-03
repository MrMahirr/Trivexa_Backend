import { Injectable, Inject } from '@nestjs/common';
import {
  STORAGE_PROVIDER,
  IStorageProvider,
  IUploadResult,
} from './storage/storage.provider.interface';

@Injectable()
export class FilesService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<IUploadResult> {
    return this.storageProvider.upload(file);
  }

  async deleteFile(key: string): Promise<void> {
    return this.storageProvider.delete(key);
  }
}
