import { Injectable } from '@nestjs/common';
import { ExpensesRepository } from '../../infrastructure/expenses.repository';

@Injectable()
export class ListExpensesUseCase {
  constructor(private readonly expensesRepo: ExpensesRepository) {}

  async execute(limit: number = 20, offset: number = 0) {
    return this.expensesRepo.findAll(limit, offset);
  }
}
