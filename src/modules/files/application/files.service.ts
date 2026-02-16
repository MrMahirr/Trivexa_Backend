import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadMetadataDto } from '../api/dto/file-upload.dto';
import { FileRecord } from '../domain/file.entity';
import { FilesRepository } from '../infrastructure/files.repository';

@Injectable()
export class FilesService {
    private readonly uploadDir = 'uploads';

    constructor(private readonly filesRepository: FilesRepository) {
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async saveFile(file: Express.Multer.File, metadata: FileUploadMetadataDto, userId: string) {
        const filename = `${uuidv4()}-${file.originalname}`;
        const filePath = path.join(this.uploadDir, filename);

        // Write file to disk
        fs.writeFileSync(filePath, file.buffer);

        // Save metadata to DB
        const fileRecord = new FileRecord();
        fileRecord.fileName = file.originalname;
        fileRecord.filePath = filePath;
        fileRecord.mimeType = file.mimetype;
        fileRecord.size = file.size;
        fileRecord.entityType = metadata.entityType;
        fileRecord.entityId = metadata.entityId;
        fileRecord.uploadedBy = userId;

        return this.filesRepository.create(fileRecord);
    }

    async findById(id: string) {
        const file = await this.filesRepository.findById(id);
        if (!file) throw new NotFoundException('File not found');
        return file;
    }

    async getFileStream(id: string) {
        const file = await this.findById(id);
        if (!fs.existsSync(file.filePath)) {
            throw new NotFoundException('File content not found on server');
        }
        return {
            stream: fs.createReadStream(file.filePath),
            record: file,
        };
    }

    async findByEntity(entityType: string, entityId: string) {
        return this.filesRepository.findByEntity(entityType, entityId);
    }
}
