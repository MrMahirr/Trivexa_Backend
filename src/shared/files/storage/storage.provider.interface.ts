
export interface IUploadResult {
    key: string;
    url: string;
    size: number;
    mimeType: string;
}

export interface IStorageProvider {
    upload(file: Express.Multer.File): Promise<IUploadResult>;
    delete(key: string): Promise<void>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
