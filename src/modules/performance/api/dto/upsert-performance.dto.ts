import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class UpsertPerformanceDto {
  @ApiProperty({ description: 'User id' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Period start (YYYY-MM-DD)' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: 'Period end (YYYY-MM-DD)' })
  @IsDateString()
  periodEnd: string;

  @ApiProperty({ example: 85 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ example: 2500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonusAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
