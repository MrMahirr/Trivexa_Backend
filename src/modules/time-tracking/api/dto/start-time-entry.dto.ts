import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class StartTimeEntryDto {
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsUUID()
    @IsOptional()
    taskId?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
