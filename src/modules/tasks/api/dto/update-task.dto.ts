import {
    IsDateString,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    priority?: string;

    @IsUUID()
    @IsOptional()
    assigneeId?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;
}
