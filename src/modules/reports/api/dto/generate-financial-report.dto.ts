import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GenerateFinancialReportDto {
  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Start Date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2023-12-31T23:59:59Z', description: 'End Date' })
  @IsDateString()
  endDate: string;
}
