import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { FileEntityType } from '../../domain/file.entity';

export class FileUploadMetadataDto {
    @IsEnum(FileEntityType)
    @IsOptional()
    entityType?: FileEntityType;

    @IsUUID()
    @IsOptional()
    entityId?: string;
}
