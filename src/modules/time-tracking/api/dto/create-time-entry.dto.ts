import {
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTimeEntryDto {
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsUUID()
    @IsOptional()
    taskId?: string;

    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @IsDateString()
    @IsNotEmpty()
    endTime: string;

    @IsString()
    @IsOptional()
    description?: string;
}
