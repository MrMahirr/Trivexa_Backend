import { ApiProperty } from '@nestjs/swagger';
import {
  StandardResponseDto,
  PaginatedDataDto,
} from '../../../../../../shared/dto/api-response.dto';

export class InvoiceDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  client_id: string;

  @ApiProperty({ example: 'INV-2024-001' })
  number: string;

  @ApiProperty({ example: 1500.0 })
  total_amount: number;

  @ApiProperty({ example: 'DRAFT' })
  status: string;

  @ApiProperty({ example: '2026-03-05T00:00:00Z' })
  issue_date: Date;

  @ApiProperty({ example: '2026-04-05T00:00:00Z', required: false })
  due_date?: Date;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaginatedInvoicesDataDto extends PaginatedDataDto<InvoiceDto> {
  @ApiProperty({ type: () => [InvoiceDto] })
  items: InvoiceDto[];
}

export class InvoicesListResponseDto extends StandardResponseDto<PaginatedInvoicesDataDto> {
  @ApiProperty({ type: () => PaginatedInvoicesDataDto })
  data: PaginatedInvoicesDataDto;
}

export class InvoiceSingleResponseDto extends StandardResponseDto<InvoiceDto> {
  @ApiProperty({ type: () => InvoiceDto })
  data: InvoiceDto;
}
