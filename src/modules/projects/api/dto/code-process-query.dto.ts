import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CodeProcessQueryDto {
  @ApiProperty({
    example: 'main',
    description: 'Optional GitHub branch name for commits feed',
    required: false,
  })
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiProperty({
    example: 6,
    description: 'Commit rows to return',
    required: false,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  commitsPerPage?: number = 6;

  @ApiProperty({
    example: 12,
    description: 'Recent task rows to return',
    required: false,
    minimum: 1,
    maximum: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  recentTaskLimit?: number = 12;
}

