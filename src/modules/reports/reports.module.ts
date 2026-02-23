import { Module } from '@nestjs/common';
import { ReportsController } from './api/reports.controller';
import { GenerateFinancialReportUseCase } from './application/usecases/generate-financial-report.usecase';
import { GenerateProjectAnalyticsUseCase } from './application/usecases/generate-project-analytics.usecase';
import { InvoicesModule } from '../finance/invoices/invoices.module';
import { ExpensesModule } from '../finance/expenses/expenses.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [InvoicesModule, ExpensesModule, ProjectsModule, TasksModule],
  controllers: [ReportsController],
  providers: [GenerateFinancialReportUseCase, GenerateProjectAnalyticsUseCase],
  exports: [GenerateFinancialReportUseCase, GenerateProjectAnalyticsUseCase],
})
export class ReportsModule {}
