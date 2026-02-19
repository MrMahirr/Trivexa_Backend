import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({ example: 'Fix login bug', description: 'Task title' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Users cannot login with email...', description: 'Task description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'HIGH', description: 'Task priority', required: false })
    @IsString()
    @IsOptional()
    priority?: string = 'MEDIUM';

    @ApiProperty({ example: 'uuid-of-assignee', description: 'Assignee User ID', required: false })
    @IsUUID()
    @IsOptional()
    assigneeId?: string;

    @ApiProperty({ example: '2023-12-31', description: 'Due date (ISO 8601)', required: false })
    @IsDateString()
    @IsOptional()
    dueDate?: string;
}
