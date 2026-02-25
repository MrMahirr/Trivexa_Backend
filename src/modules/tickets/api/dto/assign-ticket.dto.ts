import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTicketDto {
    @ApiProperty({ example: 'user-id-or-uuid', description: 'User ID to assign the ticket to' })
    @IsString()
    @IsNotEmpty()
    assigneeId: string;
}
