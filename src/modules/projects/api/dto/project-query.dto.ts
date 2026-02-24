import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectQueryDto {
  @ApiProperty({ example: 1, description: 'Page number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, description: 'Items per page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ example: 'ACTIVE', description: 'Project status', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'uuid-of-client', description: 'Client ID filter', required: false })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({ example: 'Design', description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
