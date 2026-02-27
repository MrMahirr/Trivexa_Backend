import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString } from 'class-validator';

export class StartTimerDto {
    @ApiProperty({ description: 'ID of the project being worked on', required: false })
    @IsOptional()
    @IsUUID()
    projectId?: string;

    @ApiProperty({ description: 'ID of the task being worked on', required: false })
    @IsOptional()
    @IsUUID()
    taskId?: string;

    @ApiProperty({ description: 'Optional description of the work', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
