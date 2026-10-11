import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MeetingAudienceType } from '../../domain/meeting-audience-type.enum';

export class CreateMeetingDto {
  @ApiProperty({ example: 'Project Kickoff', description: 'Meeting title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: MeetingAudienceType.PROJECT,
    description: 'Meeting audience/scope type',
    enum: MeetingAudienceType,
    required: false,
  })
  @IsEnum(MeetingAudienceType)
  @IsOptional()
  audienceType?: MeetingAudienceType = MeetingAudienceType.PERSONAL;

  @ApiProperty({
    example: '2023-01-01T10:00:00Z',
    description: 'Meeting date (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: 60,
    description: 'Duration in minutes',
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMinutes?: number = 60;

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
    example: 'MANAGEMENT',
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
    example: 'Meeting notes...',
    description: 'Notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
