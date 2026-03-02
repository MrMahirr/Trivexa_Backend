import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTicketStatusDto {
  @ApiProperty({
    example: 'IN_PROGRESS',
    description: 'New ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)',
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}
