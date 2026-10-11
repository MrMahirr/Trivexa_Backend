import { ApiProperty } from '@nestjs/swagger';
import { StandardResponseDto } from '../../../../../../shared/dto/api-response.dto';

export class PaymentDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  invoiceId: string;

  @ApiProperty({ example: 1500.0 })
  amount: number;

  @ApiProperty({ example: 'CREDIT_CARD' })
  method: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  paymentDate: Date;

  @ApiProperty({ example: 'REF-123456', required: false })
  reference?: string;

  @ApiProperty({ example: 'Payment note', required: false })
  notes?: string;

  @ApiProperty({ example: 'https://example.com/dekont.pdf', required: false })
  receiptUrl?: string;

  @ApiProperty({ example: 'uuid', required: false })
  recordedBy?: string;

  @ApiProperty({ example: 'Admin User', required: false })
  recordedByName?: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  createdAt: Date;
}

export class PaymentAuditDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid', required: false })
  paymentId?: string;

  @ApiProperty({ example: 'uuid', required: false })
  invoiceId?: string;

  @ApiProperty({ example: 'UPDATE' })
  action: string;

  @ApiProperty({ example: 'uuid', required: false })
  userId?: string;

  @ApiProperty({ example: 'Admin User', required: false })
  userName?: string;

  @ApiProperty({ required: false, type: Object })
  details?: Record<string, any>;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  createdAt: Date;
}

export class PaymentAuditPageDto {
  @ApiProperty({ type: () => [PaymentAuditDto] })
  data: PaymentAuditDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class PaymentsListResponseDto extends StandardResponseDto<PaymentDto[]> {
  @ApiProperty({ type: () => [PaymentDto] })
  data: PaymentDto[];
}

export class PaymentSingleResponseDto extends StandardResponseDto<PaymentDto> {
  @ApiProperty({ type: () => PaymentDto })
  data: PaymentDto;
}

export class PaymentAuditListResponseDto extends StandardResponseDto<PaymentAuditPageDto> {
  @ApiProperty({ type: () => PaymentAuditPageDto })
  data: PaymentAuditPageDto;
}
