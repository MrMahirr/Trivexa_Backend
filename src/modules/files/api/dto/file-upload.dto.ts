import { ApiProperty } from '@nestjs/swagger';
import { IsBooleanString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
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

  @ApiProperty({
    example: 'finance/marketing/invoice/123/odeme/2026-03-11',
    description: 'Optional folder path to store file under uploads root',
    required: false,
  })
  @IsString()
  @MaxLength(300)
  @IsOptional()
  folderPath?: string;

  @ApiProperty({
    example: false,
    description: 'Whether file is public',
    required: false,
  })
  @IsBooleanString()
  @IsOptional()
  isPublic?: string;
}
