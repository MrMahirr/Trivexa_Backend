import { ApiProperty } from '@nestjs/swagger';
import {
  StandardResponseDto,
  PaginatedDataDto,
} from '../../../../../../shared/dto/api-response.dto';

export class ExpenseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  submitted_by: string;

  @ApiProperty({ example: 'Software Licenses' })
  category: string;

  @ApiProperty({ example: 199.99 })
  amount: number;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: '2026-03-05T00:00:00Z' })
  expense_date: Date;

  @ApiProperty({ example: 'GitHub Pro subscription...', required: false })
  description?: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaginatedExpensesDataDto extends PaginatedDataDto<ExpenseDto> {
  @ApiProperty({ type: () => [ExpenseDto] })
  items: ExpenseDto[];
}

export class ExpensesListResponseDto extends StandardResponseDto<PaginatedExpensesDataDto> {
  @ApiProperty({ type: () => PaginatedExpensesDataDto })
  data: PaginatedExpensesDataDto;
}

export class ExpenseSingleResponseDto extends StandardResponseDto<ExpenseDto> {
  @ApiProperty({ type: () => ExpenseDto })
  data: ExpenseDto;
}
