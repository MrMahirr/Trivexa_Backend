import { Test, TestingModule } from '@nestjs/testing';
import { GenerateFinancialReportUseCase } from './generate-financial-report.usecase';
import { InvoicesRepository } from '../../../finance/invoices/infrastructure/invoices.repository';
import { ExpensesRepository } from '../../../finance/expenses/infrastructure/expenses.repository';

describe('GenerateFinancialReportUseCase', () => {
  let useCase: GenerateFinancialReportUseCase;
  let invoicesRepo: Partial<jest.Mocked<InvoicesRepository>>;
  let expensesRepo: Partial<jest.Mocked<ExpensesRepository>>;

  beforeEach(async () => {
    invoicesRepo = {
      sumByDateRange: jest.fn(),
    };

    expensesRepo = {
      sumByDateRange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateFinancialReportUseCase,
        { provide: InvoicesRepository, useValue: invoicesRepo },
        { provide: ExpensesRepository, useValue: expensesRepo },
      ],
    }).compile();

    useCase = module.get<GenerateFinancialReportUseCase>(
      GenerateFinancialReportUseCase,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should generate a financial report with correct calculations', async () => {
      invoicesRepo.sumByDateRange.mockResolvedValue({
        totalIssued: 50000,
        totalCollected: 35000,
      } as any);

      expensesRepo.sumByDateRange.mockResolvedValue({
        total: 20000,
        byCategory: { MARKETING: 8000, DEVELOPMENT: 12000 },
      } as any);

      const result = await useCase.execute({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      } as any);

      expect(result.revenue.billed).toBe(50000);
      expect(result.revenue.collected).toBe(35000);
      expect(result.revenue.pending).toBe(15000); // 50000 - 35000
      expect(result.expenses.total).toBe(20000);
      expect(result.financials.netProfit).toBe(15000); // 35000 - 20000
      expect(result.financials.accrualProfit).toBe(30000); // 50000 - 20000
    });

    it('should handle zero revenue scenario', async () => {
      invoicesRepo.sumByDateRange.mockResolvedValue({
        totalIssued: 0,
        totalCollected: 0,
      } as any);

      expensesRepo.sumByDateRange.mockResolvedValue({
        total: 5000,
        byCategory: { OFFICE: 5000 },
      } as any);

      const result = await useCase.execute({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      } as any);

      expect(result.financials.netProfit).toBe(-5000);
      expect(result.financials.accrualProfit).toBe(-5000);
    });
  });
});
