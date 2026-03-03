import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeEntryQueryDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', required: false })
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2023-12-31T23:59:59Z', required: false })
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 'uuid-of-project', required: false })
  @IsOptional()
  projectId?: string;

  @ApiProperty({
    example: 'uuid-of-user',
    description: 'Admin can filter by user',
    required: false,
  })
  @IsOptional()
  userId?: string;
}
