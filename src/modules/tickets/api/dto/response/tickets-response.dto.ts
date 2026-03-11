import { ApiProperty } from '@nestjs/swagger';
import {
  StandardResponseDto,
  PaginatedDataDto,
} from '../../../../../shared/dto/api-response.dto';

export class TicketDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  client_id: string;

  @ApiProperty({ example: 'uuid', required: false })
  assignee_id?: string;

  @ApiProperty({ example: 'Support request title' })
  subject: string;

  @ApiProperty({ example: 'Support request details...' })
  description: string;

  @ApiProperty({ example: 'OPEN' })
  status: string;

  @ApiProperty({ example: 'HIGH' })
  priority: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaginatedTicketsDataDto extends PaginatedDataDto<TicketDto> {
  @ApiProperty({ type: () => [TicketDto] })
  items: TicketDto[];
}

export class TicketsListResponseDto extends StandardResponseDto<PaginatedTicketsDataDto> {
  @ApiProperty({ type: () => PaginatedTicketsDataDto })
  data: PaginatedTicketsDataDto;
}

export class TicketSingleResponseDto extends StandardResponseDto<TicketDto> {
  @ApiProperty({ type: () => TicketDto })
  data: TicketDto;
}
