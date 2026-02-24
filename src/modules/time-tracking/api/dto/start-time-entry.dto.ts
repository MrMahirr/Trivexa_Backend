import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class StartTimeEntryDto {
  @ApiProperty({ example: 'uuid-of-project', description: 'Project ID', required: false })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ example: 'uuid-of-task', description: 'Task ID', required: false })
  @IsUUID()
  @IsOptional()
  taskId?: string;

  @ApiProperty({ example: 'Fixing bug #123', description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
