import { IsDateString, IsOptional } from 'class-validator';

export class GenerateFinancialReportDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}
