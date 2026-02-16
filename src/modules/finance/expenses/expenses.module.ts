import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { ExpensesController } from './api/expenses.controller';
import { ExpensesService } from './application/expenses.service';
import { ExpensesRepository } from './infrastructure/expenses.repository';

@Module({
    imports: [DatabaseModule],
    controllers: [ExpensesController],
    providers: [ExpensesService, ExpensesRepository],
    exports: [ExpensesService],
})
export class ExpensesModule { }
