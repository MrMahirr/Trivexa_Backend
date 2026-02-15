import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    priority?: string = 'MEDIUM';

    @IsUUID()
    @IsOptional()
    assigneeId?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;
}
