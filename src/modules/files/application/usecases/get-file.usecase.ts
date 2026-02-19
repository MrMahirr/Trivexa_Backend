import { Injectable, NotFoundException } from '@nestjs/common';
import { FilesRepository } from '../../infrastructure/files.repository';
import { FileEntity } from '../../domain/file.entity';

@Injectable()
export class GetFileUseCase {
    constructor(private readonly filesRepository: FilesRepository) { }

    async execute(id: string): Promise<FileEntity> {
        const file = await this.filesRepository.findById(id);
        if (!file) {
            throw new NotFoundException('File not found');
        }
        return file;
    }
}
