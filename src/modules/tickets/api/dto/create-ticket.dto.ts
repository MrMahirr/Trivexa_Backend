import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TICKET_PRIORITIES, TICKET_TYPES } from '../../domain/ticket.entity';

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(TICKET_TYPES)
    @IsOptional()
    type?: string = 'SUPPORT';

    @IsEnum(TICKET_PRIORITIES)
    @IsOptional()
    priority?: string = 'MEDIUM';
}
