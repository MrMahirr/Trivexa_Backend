import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class AuditRetentionDto {
  @ApiPropertyOptional({ default: 180, minimum: 1, maximum: 3650 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(3650)
  retentionDays?: number = 180;
}
