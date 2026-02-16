import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '../../../../database/transaction';
import { CreateExpenseDto } from '../api/dto/create-expense.dto';
import { ExpenseEntity, ExpenseStatus } from '../domain/expense.entity';
import { ExpensesRepository } from '../infrastructure/expenses.repository';

@Injectable()
export class ExpensesService {
    constructor(
        private readonly expensesRepository: ExpensesRepository,
        private readonly transactionManager: TransactionManager,
    ) { }

    async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<ExpenseEntity> {
        return this.transactionManager.run(async (client) => {
            return this.expensesRepository.create({
                ...createExpenseDto,
                expenseDate: createExpenseDto.expenseDate ? new Date(createExpenseDto.expenseDate) : new Date(),
                requestedBy: userId,
            }, client);
        });
    }

    async findAll(): Promise<ExpenseEntity[]> {
        return this.expensesRepository.findAll();
    }

    async findById(id: string): Promise<ExpenseEntity> {
        const expense = await this.expensesRepository.findById(id);
        if (!expense) {
            throw new NotFoundException('Expense not found');
        }
        return expense;
    }

    async approve(id: string, approverId: string): Promise<ExpenseEntity> {
        // Validation logic can be added here (e.g. check if user has permission to approve)
        // For now, we assume RoleGuard handles permission, so we just update status.
        return this.expensesRepository.updateStatus(id, ExpenseStatus.APPROVED, approverId);
    }

    async reject(id: string, rejectorId: string): Promise<ExpenseEntity> {
        return this.expensesRepository.updateStatus(id, ExpenseStatus.REJECTED, rejectorId);
    }
}
