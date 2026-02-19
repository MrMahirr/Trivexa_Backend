import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InvoiceStatus } from '../../domain/invoice.entity';

export class UpdateInvoiceStatusDto {
    @ApiProperty({ enum: InvoiceStatus })
    @IsEnum(InvoiceStatus)
    @IsNotEmpty()
    status: InvoiceStatus;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}
