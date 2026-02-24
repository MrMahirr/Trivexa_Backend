import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class GenerateProjectAnalyticsDto {
  @ApiProperty({ example: 'uuid-of-project', description: 'Project ID for specific analytics', required: false })
  @IsUUID()
  @IsOptional()
  projectId?: string;
}
