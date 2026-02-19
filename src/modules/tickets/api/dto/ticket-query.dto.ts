import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TICKET_PRIORITIES, TICKET_STATUSES, TICKET_TYPES } from '../../domain/ticket.entity';

export class TicketQueryDto {
    @ApiProperty({ example: 1, description: 'Page number', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ example: 20, description: 'Items per page', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiProperty({ enum: TICKET_STATUSES, example: 'OPEN', description: 'Filter by status', required: false })
    @IsEnum(TICKET_STATUSES)
    @IsOptional()
    status?: string;

    @ApiProperty({ enum: TICKET_PRIORITIES, example: 'HIGH', description: 'Filter by priority', required: false })
    @IsEnum(TICKET_PRIORITIES)
    @IsOptional()
    priority?: string;

    @ApiProperty({ enum: TICKET_TYPES, example: 'BUG', description: 'Filter by type', required: false })
    @IsEnum(TICKET_TYPES)
    @IsOptional()
    type?: string;
}
