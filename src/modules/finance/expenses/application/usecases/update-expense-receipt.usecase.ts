import { Injectable } from '@nestjs/common';
import { ExpensesRepository } from '../../infrastructure/expenses.repository';
import { ExpenseEntity } from '../../domain/expense.entity';
import { ExpenseNotFoundException } from '../../domain/expense.errors';

@Injectable()
export class UpdateExpenseReceiptUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(id: string, receiptUrl?: string): Promise<ExpenseEntity> {
    const updated = await this.expensesRepository.updateReceipt(id, receiptUrl);
    if (!updated) {
      throw new ExpenseNotFoundException(id);
    }
    return updated;
  }
}
