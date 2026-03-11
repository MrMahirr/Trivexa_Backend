import { ApiProperty } from '@nestjs/swagger';
import {
  StandardResponseDto,
  PaginatedDataDto,
} from '../../../../../shared/dto/api-response.dto';

export class ClientDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Acme Corp' })
  company_name: string;

  @ApiProperty({ example: '555-1234', required: false })
  phone?: string;

  @ApiProperty({ example: '1234567890', required: false })
  tax_number?: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaginatedClientsDataDto extends PaginatedDataDto<ClientDto> {
  @ApiProperty({ type: () => [ClientDto] })
  items: ClientDto[];
}

export class ClientsListResponseDto extends StandardResponseDto<PaginatedClientsDataDto> {
  @ApiProperty({ type: () => PaginatedClientsDataDto })
  data: PaginatedClientsDataDto;
}

export class ClientSingleResponseDto extends StandardResponseDto<ClientDto> {
  @ApiProperty({ type: () => ClientDto })
  data: ClientDto;
}
