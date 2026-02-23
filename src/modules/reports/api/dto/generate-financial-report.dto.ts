import { IsDateString } from 'class-validator';

export class GenerateFinancialReportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
