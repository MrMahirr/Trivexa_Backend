import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString } from 'class-validator';

export class PerformanceQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user id' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Period start (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Period end (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
