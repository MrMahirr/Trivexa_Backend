import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MeetingAudienceType } from '../../domain/meeting-audience-type.enum';

export class UpdateMeetingDto {
  @ApiProperty({
    example: 'Updated Meeting Title',
    description: 'Meeting title',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: MeetingAudienceType.DEPARTMENT,
    description: 'Meeting audience/scope type',
    enum: MeetingAudienceType,
    required: false,
  })
  @IsEnum(MeetingAudienceType)
  @IsOptional()
  audienceType?: MeetingAudienceType;

  @ApiProperty({
    example: '2023-06-15T14:00:00Z',
    description: 'Meeting date (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    example: 90,
    description: 'Duration in minutes',
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({
    example: 'uuid-of-client',
    description: 'Client ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    example: 'uuid-of-project',
    description: 'Project ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiProperty({
    example: 'MARKETING',
    description: 'Department code for department-based meetings',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: 'https://meet.google.com/abc-defg-hij',
    description: 'Meeting link',
    required: false,
  })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty({
    example: 'Updated notes...',
    description: 'Meeting notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: 'Meeting summary...',
    description: 'Meeting summary/minutes',
    required: false,
  })
  @IsString()
  @IsOptional()
  summary?: string;
}
