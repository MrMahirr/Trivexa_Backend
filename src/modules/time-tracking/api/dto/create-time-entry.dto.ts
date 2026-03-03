import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTimeEntryDto {
  @ApiProperty({
    example: 'uuid-of-project',
    description: 'Project ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiProperty({
    example: 'uuid-of-task',
    description: 'Task ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  taskId?: string;

  @ApiProperty({ example: '2023-01-01T09:00:00Z', description: 'Start time' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2023-01-01T17:00:00Z', description: 'End time' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    example: 'Worked on frontend UI',
    description: 'Description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
