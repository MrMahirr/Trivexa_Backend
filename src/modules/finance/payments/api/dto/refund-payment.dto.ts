import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({
    example: 250,
    description: 'Refund amount. If omitted, full payment amount is refunded.',
    required: false,
  })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiProperty({
    example: 'Partial refund due to invoice correction',
    description: 'Refund reason',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    example: '2026-03-08',
    description: 'Refund date (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiProperty({
    example: 'https://example.com/refund-receipt.pdf',
    description: 'Refund receipt URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
