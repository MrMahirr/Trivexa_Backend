import { Test, TestingModule } from '@nestjs/testing';
import { CreateExpenseUseCase } from './create-expense.usecase';
import { ExpensesRepository } from '../../infrastructure/expenses.repository';
import { DatabasePool } from '../../../../../database/pool';
import { ExpenseCategory } from '../../domain/expense.entity';

describe('CreateExpenseUseCase', () => {
    let useCase: CreateExpenseUseCase;
    let expensesRepo: Partial<jest.Mocked<ExpensesRepository>>;
    let dbPool: Partial<DatabasePool>;
    let mockClient: any;

    const mockDto: any = {
        description: 'Office supplies purchase',
        amount: 250.50,
        category: ExpenseCategory.OFFICE,
        expenseDate: '2026-01-10',
        department: 'Engineering',
        receiptUrl: 'https://example.com/receipt.pdf',
    };

    beforeEach(async () => {
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };

        dbPool = {
            getPool: jest.fn().mockReturnValue({
                connect: jest.fn().mockResolvedValue(mockClient),
            }),
        };

        expensesRepo = {
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateExpenseUseCase,
                { provide: ExpensesRepository, useValue: expensesRepo },
                { provide: DatabasePool, useValue: dbPool },
            ],
        }).compile();

        useCase = module.get<CreateExpenseUseCase>(CreateExpenseUseCase);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create expense successfully', async () => {
            const createdExpense = {
                id: 'exp-1',
                description: mockDto.description,
                amount: mockDto.amount,
                category: mockDto.category,
                department: mockDto.department,
                requestedBy: 'user-1',
            };

            expensesRepo.create.mockResolvedValue(createdExpense as any);

            const result = await useCase.execute(mockDto, 'user-1');

            expect(result).toEqual(createdExpense);
            expect(expensesRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: mockDto.description,
                    amount: mockDto.amount,
                    category: mockDto.category,
                    department: mockDto.department,
                    requestedBy: 'user-1',
                    receiptUrl: mockDto.receiptUrl,
                }),
                mockClient,
            );
        });

        it('should use current date when expenseDate is not provided', async () => {
            const dtoWithoutDate: any = {
                description: 'Lunch',
                amount: 50,
                category: ExpenseCategory.MEALS,
                department: 'HR',
            };

            expensesRepo.create.mockResolvedValue({ id: 'exp-2' } as any);

            const beforeCall = new Date();
            await useCase.execute(dtoWithoutDate, 'user-1');

            const callArgs = expensesRepo.create.mock.calls[0][0] as any;
            const expenseDate = callArgs.expenseDate as Date;

            expect(expenseDate).toBeInstanceOf(Date);
            expect(expenseDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        });

        it('should always release client even on success', async () => {
            expensesRepo.create.mockResolvedValue({ id: 'exp-3' } as any);

            await useCase.execute(mockDto, 'user-1');

            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should release client on error', async () => {
            expensesRepo.create.mockRejectedValue(new Error('DB Error'));

            await expect(useCase.execute(mockDto, 'user-1')).rejects.toThrow('DB Error');

            expect(mockClient.release).toHaveBeenCalled();
        });
    });
});
