import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class ConvertToTicketDto {
  @ApiProperty({
    description: 'The ID of the project this ticket belongs to',
    example: 'uuid-project-1234',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'The user ID to whom this ticket will be assigned',
    required: false,
    example: 'uuid-user-5678',
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    description: 'The priority of the ticket',
    enum: TicketPriority,
    example: TicketPriority.MEDIUM,
    default: TicketPriority.MEDIUM,
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority = TicketPriority.MEDIUM;

  @ApiProperty({
    description:
      'Custom notes to prepend/append to the meeting summary (Optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  additionalNotes?: string;
}
