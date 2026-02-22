import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from '../api/dto/create-expense.dto';
import { ExpenseEntity, ExpenseStatus } from '../domain/expense.entity';
import { ExpensesRepository } from '../infrastructure/expenses.repository';
import { CreateExpenseUseCase } from './usecases/create-expense.usecase';
import { ListExpensesUseCase } from './usecases/list-expenses.usecase';
import { UpdateExpenseStatusUseCase } from './usecases/update-expense-status.usecase';

@Injectable()
export class ExpensesService {
    constructor(
        private readonly expensesRepository: ExpensesRepository,
        private readonly createExpenseUseCase: CreateExpenseUseCase,
        private readonly listExpensesUseCase: ListExpensesUseCase,
        private readonly updateExpenseStatusUseCase: UpdateExpenseStatusUseCase,
    ) { }

    async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<ExpenseEntity> {
        return this.createExpenseUseCase.execute(createExpenseDto, userId);
    }

    async findAll(): Promise<ExpenseEntity[]> {
        return this.listExpensesUseCase.execute();
    }

    async findById(id: string): Promise<ExpenseEntity> {
        const expense = await this.expensesRepository.findById(id);
        if (!expense) {
            throw new NotFoundException('Expense not found');
        }
        return expense;
    }

    async approve(id: string, approverId: string): Promise<ExpenseEntity> {
        return this.updateExpenseStatusUseCase.execute(id, ExpenseStatus.APPROVED, approverId);
    }

    async reject(id: string, rejectorId: string): Promise<ExpenseEntity> {
        return this.updateExpenseStatusUseCase.execute(id, ExpenseStatus.REJECTED, rejectorId);
    }
}

