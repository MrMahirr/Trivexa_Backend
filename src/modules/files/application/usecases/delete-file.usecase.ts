import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FilesService } from '../../../../shared/files/files.service';
import { FilesRepository } from '../../infrastructure/files.repository';
import { FileNotFoundException } from '../../domain/file.errors';

@Injectable()
export class DeleteFileUseCase {
  private readonly logger = new Logger(DeleteFileUseCase.name);

  constructor(
    private readonly storageService: FilesService,
    private readonly filesRepository: FilesRepository,
  ) {}

  async execute(fileId: string): Promise<void> {
    const file = await this.filesRepository.findById(fileId);
    if (!file) {
      throw new FileNotFoundException();
    }

    // 1. Delete from Storage
    // Assuming filePath stores the relative URL like /uploads/filename.ext
    const filename = file.filePath.split('/').pop();
    if (filename) {
      await this.storageService.deleteFile(filename);
    }

    // 2. Delete from DB (Implement soft delete or hard delete in Repo)
    // For now, let's assume hard delete or we just leave metadata?
    // Ideally we should delete the record.
    // await this.filesRepository.delete(fileId);
    this.logger.log(`File deleted: ${fileId}`);
  }
}
