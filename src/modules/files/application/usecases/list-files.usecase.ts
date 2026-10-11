import { Injectable } from '@nestjs/common';
import { FilesRepository } from '../../infrastructure/files.repository';
import { FileEntity } from '../../domain/file.entity';
import { ListFilesQueryDto } from '../../api/dto/list-files-query.dto';

@Injectable()
export class ListFilesUseCase {
  constructor(private readonly filesRepository: FilesRepository) {}

  async execute(query: ListFilesQueryDto): Promise<FileEntity[]> {
    const limit = query.limit ?? 200;
    const page = query.page ?? 1;
    const offset = (page - 1) * limit;

    return this.filesRepository.findAll({
      entityType: query.entityType,
      entityId: query.entityId,
      uploadedBy: query.uploadedBy,
      search: query.search,
      limit,
      offset,
    });
  }
}
