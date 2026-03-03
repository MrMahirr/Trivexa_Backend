import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { ExpensesController } from './api/expenses.controller';
import { ExpensesService } from './application/expenses.service';
import { ExpensesRepository } from './infrastructure/expenses.repository';
import { CreateExpenseUseCase } from './application/usecases/create-expense.usecase';
import { ListExpensesUseCase } from './application/usecases/list-expenses.usecase';
import { UpdateExpenseStatusUseCase } from './application/usecases/update-expense-status.usecase';

@Module({
  imports: [DatabaseModule],
  controllers: [ExpensesController],
  providers: [
    ExpensesService,
    ExpensesRepository,
    CreateExpenseUseCase,
    ListExpensesUseCase,
    UpdateExpenseStatusUseCase,
  ],
  exports: [
    ExpensesService,
    ExpensesRepository,
    CreateExpenseUseCase,
    ListExpensesUseCase,
    UpdateExpenseStatusUseCase,
  ],
})
export class ExpensesModule {}
