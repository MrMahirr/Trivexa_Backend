import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TICKET_PRIORITIES, TICKET_STATUSES, TICKET_TYPES } from '../../domain/ticket.entity';

export class TicketQueryDto {
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

    @IsEnum(TICKET_STATUSES)
    @IsOptional()
    status?: string;

    @IsEnum(TICKET_PRIORITIES)
    @IsOptional()
    priority?: string;

    @IsEnum(TICKET_TYPES)
    @IsOptional()
    type?: string;
}
