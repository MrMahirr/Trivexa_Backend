import { Injectable, Logger } from '@nestjs/common';
import { DatabasePool } from '../../../../../database/pool';
import { ExpensesRepository } from '../../infrastructure/expenses.repository';
import { CreateExpenseDto } from '../../api/dto/create-expense.dto';

@Injectable()
export class CreateExpenseUseCase {
  private readonly logger = new Logger(CreateExpenseUseCase.name);

  constructor(
    private readonly expensesRepo: ExpensesRepository,
    private readonly dbPool: DatabasePool,
  ) {}

  async execute(dto: CreateExpenseDto, requestedByUserId: string) {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      // Check budget or other business rules here if needed

      const expenseData = {
        ...dto,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
        requestedBy: requestedByUserId,
      };

      const expense = await this.expensesRepo.create(expenseData, client);

      this.logger.log(`Expense created: ${expense.id} by ${requestedByUserId}`);
      return expense;
    } finally {
      client.release();
    }
  }
}
