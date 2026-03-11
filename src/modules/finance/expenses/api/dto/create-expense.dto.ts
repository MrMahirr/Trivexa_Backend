import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../../domain/expense.entity';
import { Currency } from '../../../../../shared/enums/currency.enum';

export class CreateExpenseDto {
  @ApiProperty({
    example: 'Office supplies',
    description: 'Expense description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 150.5, description: 'Expense amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    enum: Currency,
    example: Currency.TRY,
    description: 'Expense currency',
  })
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency = Currency.TRY;

  @ApiProperty({
    enum: ExpenseCategory,
    example: ExpenseCategory.OFFICE,
    description: 'Expense category',
  })
  @IsEnum(ExpenseCategory)
  @IsNotEmpty()
  category: ExpenseCategory;

  @ApiProperty({
    example: '2023-01-01',
    description: 'Expense date (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expenseDate?: string;

  @ApiProperty({ example: 'HR Department', description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    example: 'https://example.com/receipt.pdf',
    description: 'Receipt URL',
    required: false,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  receiptUrl?: string;
}
