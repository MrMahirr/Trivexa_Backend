import { Module } from '@nestjs/common';
import { FilesController } from './api/files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { STORAGE_PROVIDER } from '../../shared/files/storage/storage.provider.interface';
import { LocalFileProvider } from '../../shared/files/storage/local-storage.provider';
import { FilesService } from '../../shared/files/files.service';
import { FilesRepository } from './infrastructure/files.repository';
import { UploadFileUseCase } from './application/usecases/upload-file.usecase';
import { DeleteFileUseCase } from './application/usecases/delete-file.usecase';
import { GetFileUseCase } from './application/usecases/get-file.usecase';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [
        DatabaseModule, // Required for FilesRepository
        MulterModule.register({
            storage: memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
            },
        }),
    ],
    controllers: [FilesController],
    providers: [
        FilesService, // Shared Service
        FilesRepository,
        UploadFileUseCase,
        DeleteFileUseCase,
        GetFileUseCase,
        {
            provide: STORAGE_PROVIDER,
            useClass: LocalFileProvider,
        },
    ],
    exports: [STORAGE_PROVIDER, FilesService, FilesRepository],
})
export class FilesModule { }
