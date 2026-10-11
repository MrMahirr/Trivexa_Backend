import { ApiProperty } from '@nestjs/swagger';
import { StandardResponseDto } from '../../../../../shared/dto/api-response.dto';

export class FileMetadataDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'document.pdf' })
  original_name: string;

  @ApiProperty({ example: 'application/pdf' })
  mime_type: string;

  @ApiProperty({ example: 102456 })
  size: number;

  @ApiProperty({ example: 'projects', required: false })
  entity_type?: string;

  @ApiProperty({ example: 'uuid', required: false })
  entity_id?: string;

  @ApiProperty({ example: 'uuid', required: false })
  uploaded_by?: string;

  @ApiProperty({ example: true })
  is_public: boolean;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class FileUploadResponseDto extends StandardResponseDto<FileMetadataDto> {
  @ApiProperty({ type: () => FileMetadataDto })
  data: FileMetadataDto;
}

export class FileMetadataResponseDto extends StandardResponseDto<FileMetadataDto> {
  @ApiProperty({ type: () => FileMetadataDto })
  data: FileMetadataDto;
}
