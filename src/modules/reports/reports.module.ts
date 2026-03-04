import { Module } from '@nestjs/common';
import { ReportsController } from './api/reports.controller';
import { GenerateFinancialReportUseCase } from './application/usecases/generate-financial-report.usecase';
import { GenerateProjectAnalyticsUseCase } from './application/usecases/generate-project-analytics.usecase';
import { DashboardSummaryUseCase } from './application/usecases/dashboard-summary.usecase';
import { InvoicesModule } from '../finance/invoices/invoices.module';
import { ExpensesModule } from '../finance/expenses/expenses.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    InvoicesModule,
    ExpensesModule,
    ProjectsModule,
    TasksModule,
    DatabaseModule,
  ],
  controllers: [ReportsController],
  providers: [
    GenerateFinancialReportUseCase,
    GenerateProjectAnalyticsUseCase,
    DashboardSummaryUseCase,
  ],
  exports: [
    GenerateFinancialReportUseCase,
    GenerateProjectAnalyticsUseCase,
    DashboardSummaryUseCase,
  ],
})
export class ReportsModule {}
