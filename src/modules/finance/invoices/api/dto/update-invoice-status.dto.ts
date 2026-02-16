import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InvoiceStatus } from '../../domain/invoice.entity';

export class UpdateInvoiceStatusDto {
    @IsEnum(InvoiceStatus)
    @IsNotEmpty()
    status: InvoiceStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}
