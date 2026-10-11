import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../domain/payment.entity';

export class UpdatePaymentDto {
  @ApiProperty({
    example: 1500.0,
    description: 'Payment amount',
    required: false,
  })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
    description: 'Payment method',
    required: false,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @ApiProperty({
    example: '2026-03-08',
    description: 'Payment date (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiProperty({
    example: 'REF-123456',
    description: 'Payment reference',
    required: false,
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({
    example: 'Payment note',
    description: 'Payment notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: 'https://example.com/dekont.pdf',
    description: 'Receipt URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
