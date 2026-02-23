import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FileEntityType } from '../../domain/file.entity';

export class FileUploadMetadataDto {
  @ApiProperty({
    enum: FileEntityType,
    example: FileEntityType.PROJECT,
    description: 'Entity type associated with file',
    required: false,
  })
  @IsEnum(FileEntityType)
  @IsOptional()
  entityType?: FileEntityType;

  @ApiProperty({
    example: 'uuid-of-entity',
    description: 'Entity ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  entityId?: string;
}
