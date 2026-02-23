import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty({
    example: 'Web Development Services',
    description: 'Item description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1, description: 'Quantity' })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 100.0, description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'uuid-of-client', description: 'Client ID' })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    example: 'uuid-of-project',
    description: 'Project ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiProperty({
    type: [CreateInvoiceItemDto],
    description: 'List of invoice items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @ApiProperty({
    example: 20,
    description: 'Tax rate percentage',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate: number = 20; // Default VAT %20

  @ApiProperty({
    example: '2023-01-01',
    description: 'Issue date (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiProperty({
    example: '2023-01-15',
    description: 'Due date (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    example: 'Payment due within 15 days',
    description: 'Invoice notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
