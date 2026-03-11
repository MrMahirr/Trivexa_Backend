import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateExpenseReceiptDto {
  @ApiProperty({
    example: '/uploads/finance/marketing/gider/2026-03-11/receipt.pdf',
    description: 'Receipt URL or file path',
    required: false,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  receiptUrl?: string;
}
