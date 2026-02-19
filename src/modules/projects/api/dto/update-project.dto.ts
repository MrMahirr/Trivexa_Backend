import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class UpdateProjectDto {
    @ApiProperty({ example: 'Updated Project Name', description: 'Project name', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Updated description', description: 'Project description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 6000, description: 'Project budget', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    budget?: number;

    @ApiProperty({ example: '2023-01-01', description: 'Start date (ISO 8601)', required: false })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ example: '2023-12-31', description: 'Deadline (ISO 8601)', required: false })
    @IsDateString()
    @IsOptional()
    deadline?: string;
}
