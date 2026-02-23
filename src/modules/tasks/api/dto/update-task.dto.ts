import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'Fix login bug (updated)',
    description: 'Task title',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Updated description',
    description: 'Task description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'LOW',
    description: 'Task priority',
    required: false,
  })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty({
    example: 'uuid-of-assignee',
    description: 'Assignee User ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Due date (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
