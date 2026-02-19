import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '../../domain/payment.entity';

export class CreatePaymentDto {
    @ApiProperty({ example: 'uuid-of-invoice', description: 'Invoice ID' })
    @IsUUID()
    @IsNotEmpty()
    invoiceId: string;

    @ApiProperty({ example: 1500.00, description: 'Payment amount' })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.BANK_TRANSFER, description: 'Payment method' })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    method: PaymentMethod;

    @ApiProperty({ example: '2023-01-20', description: 'Payment date (ISO 8601)', required: false })
    @IsDateString()
    @IsOptional()
    paymentDate?: string;

    @ApiProperty({ example: 'REF-123456', description: 'Payment reference', required: false })
    @IsString()
    @IsOptional()
    reference?: string;

    @ApiProperty({ example: 'Payment for Invoice #1001', description: 'Notes', required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}
