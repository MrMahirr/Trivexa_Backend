import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../../database/pool';
import { ExpensesRepository } from '../../infrastructure/expenses.repository';
import { ExpenseStatus } from '../../domain/expense.entity';
import { ExpenseNotFoundException } from '../../domain/expense.errors';

@Injectable()
export class UpdateExpenseStatusUseCase {
  constructor(
    private readonly expensesRepo: ExpensesRepository,
    private readonly dbPool: DatabasePool,
  ) {}

  async execute(id: string, status: ExpenseStatus, approvedByUserId: string) {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const expense = await this.expensesRepo.findById(id);
      if (!expense) throw new ExpenseNotFoundException(id);

      const updated = await this.expensesRepo.updateStatus(
        id,
        status,
        approvedByUserId,
        client,
      );
      return updated;
    } finally {
      client.release();
    }
  }
}
