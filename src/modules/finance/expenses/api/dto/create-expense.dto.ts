import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ExpenseCategory } from '../../domain/expense.entity';

export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsEnum(ExpenseCategory)
    @IsNotEmpty()
    category: ExpenseCategory;

    @IsDateString()
    @IsOptional()
    expenseDate?: string;

    @IsString()
    @IsNotEmpty()
    department: string;

    @IsUrl()
    @IsOptional()
    receiptUrl?: string;
}
