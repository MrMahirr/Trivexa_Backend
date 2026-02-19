import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TICKET_PRIORITIES, TICKET_TYPES } from '../../domain/ticket.entity';

export class CreateTicketDto {
    @ApiProperty({ example: 'Cannot access dashboard', description: 'Ticket subject' })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({ example: 'I get a 500 error when...', description: 'Ticket description' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: TICKET_TYPES, example: 'SUPPORT', description: 'Ticket type', required: false })
    @IsEnum(TICKET_TYPES)
    @IsOptional()
    type?: string = 'SUPPORT';

    @ApiProperty({ enum: TICKET_PRIORITIES, example: 'MEDIUM', description: 'Ticket priority', required: false })
    @IsEnum(TICKET_PRIORITIES)
    @IsOptional()
    priority?: string = 'MEDIUM';
}
