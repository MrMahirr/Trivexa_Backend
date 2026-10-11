import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../domain/payment.entity';

export class ListPaymentsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 200 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 200;

  @ApiProperty({ required: false, description: 'Filter by invoice id' })
  @IsUUID()
  @IsOptional()
  invoiceId?: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @ApiProperty({ required: false, example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, example: '2026-01-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    required: false,
    description: 'Search in invoice number, client name and reference',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
