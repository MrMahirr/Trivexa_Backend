import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3StorageProvider } from './storage/s3-storage.provider';
import { FilesService } from './files.service';

@Module({
    imports: [ConfigModule],
    providers: [S3StorageProvider, FilesService],
    exports: [S3StorageProvider, FilesService],
})
export class FilesModule { }
