import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from '../../../finance/invoices/infrastructure/invoices.repository';
import { ExpensesRepository } from '../../../finance/expenses/infrastructure/expenses.repository';
import { GenerateFinancialReportDto } from '../../api/dto/generate-financial-report.dto';

@Injectable()
export class GenerateFinancialReportUseCase {
    constructor(
        private readonly invoicesRepo: InvoicesRepository,
        private readonly expensesRepo: ExpensesRepository,
    ) { }

    async execute(dto: GenerateFinancialReportDto) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);

        const [invoiceData, expenseData] = await Promise.all([
            this.invoicesRepo.sumByDateRange(startDate, endDate),
            this.expensesRepo.sumByDateRange(startDate, endDate),
        ]);

        const totalRevenue = invoiceData.totalIssued;
        const totalCollected = invoiceData.totalCollected;
        const totalExpenses = expenseData.total;
        const netProfit = totalCollected - totalExpenses; // Profit based on actual collection, or use totalRevenue for accrual basis

        return {
            period: {
                startDate,
                endDate,
            },
            revenue: {
                billed: totalRevenue,
                collected: totalCollected,
                pending: totalRevenue - totalCollected,
            },
            expenses: {
                total: totalExpenses,
                byCategory: expenseData.byCategory,
            },
            financials: {
                netProfit, // Cash basis profit (Collected - Expenses)
                accrualProfit: totalRevenue - totalExpenses, // Accrual basis profit (Billed - Expenses)
            }
        };
    }
}
