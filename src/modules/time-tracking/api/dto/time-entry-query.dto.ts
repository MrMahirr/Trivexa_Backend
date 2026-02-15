import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeEntryQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    startDate?: string;

    @IsOptional()
    endDate?: string;

    @IsOptional()
    projectId?: string;

    @IsOptional()
    userId?: string; // Admin can filter by user
}
