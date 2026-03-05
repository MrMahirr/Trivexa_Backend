import { ApiProperty } from '@nestjs/swagger';
import { StandardResponseDto } from '../../../../../../shared/dto/api-response.dto';

export class PaymentDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  invoice_id: string;

  @ApiProperty({ example: 1500.00 })
  amount: number;

  @ApiProperty({ example: 'CREDIT_CARD' })
  payment_method: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  payment_date: Date;

  @ApiProperty({ example: 'txn_1234567890', required: false })
  transaction_reference?: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaymentsListResponseDto extends StandardResponseDto<PaymentDto[]> {
  @ApiProperty({ type: () => [PaymentDto] })
  data: PaymentDto[];
}

export class PaymentSingleResponseDto extends StandardResponseDto<PaymentDto> {
  @ApiProperty({ type: () => PaymentDto })
  data: PaymentDto;
}
