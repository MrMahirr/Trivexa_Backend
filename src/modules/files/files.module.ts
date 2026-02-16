import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { FilesController } from './api/files.controller';
import { FilesService } from './application/files.service';
import { FilesRepository } from './infrastructure/files.repository';

@Module({
    imports: [DatabaseModule],
    providers: [FilesService, FilesRepository],
    controllers: [FilesController],
    exports: [FilesService],
})
export class FilesModule { }
