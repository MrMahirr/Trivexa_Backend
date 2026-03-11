import { Injectable, Inject } from '@nestjs/common';
import {
  STORAGE_PROVIDER,
  IStorageProvider,
  IUploadResult,
  UploadOptions,
} from './storage/storage.provider.interface';

@Injectable()
export class FilesService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  async uploadFile(file: Express.Multer.File, options?: UploadOptions): Promise<IUploadResult> {
    return this.storageProvider.upload(file, options);
  }

  async deleteFile(key: string): Promise<void> {
    return this.storageProvider.delete(key);
  }
}
