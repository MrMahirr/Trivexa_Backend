import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceNotFoundException } from '../../../invoices/domain/invoice.errors';
import { ProcessPaymentUseCase } from './process-payment.usecase';
import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { InvoicesRepository } from '../../../invoices/infrastructure/invoices.repository';
import { DatabasePool } from '../../../../../database/pool';
import { InvoiceStatus } from '../../../invoices/domain/invoice.entity';
import { PaymentMethod } from '../../domain/payment.entity';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let paymentsRepo: Partial<jest.Mocked<PaymentsRepository>>;
  let invoicesRepo: Partial<jest.Mocked<InvoicesRepository>>;
  let dbPool: Partial<DatabasePool>;
  let mockClient: any;

  const mockInvoice: any = {
    id: 'inv-1',
    invoiceNumber: 'INV-000001-001',
    status: InvoiceStatus.SENT,
    total: 1000,
  };

  const mockDto: any = {
    invoiceId: 'inv-1',
    amount: 500,
    method: PaymentMethod.BANK_TRANSFER,
    paymentDate: '2026-01-20',
    reference: 'REF-123',
    notes: 'Partial payment',
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

    paymentsRepo = {
      create: jest.fn(),
      sumPaymentsByInvoiceId: jest.fn(),
    };

    invoicesRepo = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        { provide: PaymentsRepository, useValue: paymentsRepo },
        { provide: InvoicesRepository, useValue: invoicesRepo },
        { provide: DatabasePool, useValue: dbPool },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should process payment and mark invoice as PARTIALLY_PAID', async () => {
      const createdPayment = { id: 'pay-1', ...mockDto };

      invoicesRepo.findById.mockResolvedValue(mockInvoice);
      paymentsRepo.create.mockResolvedValue(createdPayment);
      paymentsRepo.sumPaymentsByInvoiceId.mockResolvedValue(500); // 500 < 1000

      const result = await useCase.execute(mockDto, 'user-1');

      expect(result).toEqual(createdPayment);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(invoicesRepo.updateStatus).toHaveBeenCalledWith(
        'inv-1',
        InvoiceStatus.PARTIALLY_PAID,
        mockClient,
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should mark invoice as PAID when fully paid', async () => {
      invoicesRepo.findById.mockResolvedValue(mockInvoice);
      paymentsRepo.create.mockResolvedValue({ id: 'pay-2' } as any);
      paymentsRepo.sumPaymentsByInvoiceId.mockResolvedValue(1000); // 1000 >= 1000

      await useCase.execute(mockDto, 'user-1');

      expect(invoicesRepo.updateStatus).toHaveBeenCalledWith(
        'inv-1',
        InvoiceStatus.PAID,
        mockClient,
      );
    });

    it('should mark invoice as PAID when overpaid', async () => {
      invoicesRepo.findById.mockResolvedValue(mockInvoice);
      paymentsRepo.create.mockResolvedValue({ id: 'pay-3' } as any);
      paymentsRepo.sumPaymentsByInvoiceId.mockResolvedValue(1200); // 1200 > 1000

      await useCase.execute(mockDto, 'user-1');

      expect(invoicesRepo.updateStatus).toHaveBeenCalledWith(
        'inv-1',
        InvoiceStatus.PAID,
        mockClient,
      );
    });

    it('should not update status if it has not changed', async () => {
      const alreadyPartialInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.PARTIALLY_PAID,
      };
      invoicesRepo.findById.mockResolvedValue(alreadyPartialInvoice);
      paymentsRepo.create.mockResolvedValue({ id: 'pay-4' } as any);
      paymentsRepo.sumPaymentsByInvoiceId.mockResolvedValue(500); // still partially paid

      await useCase.execute(mockDto, 'user-1');

      expect(invoicesRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw InvoiceNotFoundException when invoice not found', async () => {
      invoicesRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(mockDto, 'user-1')).rejects.toThrow(
        InvoiceNotFoundException,
      );

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback and release client on error', async () => {
      invoicesRepo.findById.mockResolvedValue(mockInvoice);
      paymentsRepo.create.mockImplementation(() => Promise.reject(new Error('DB Error')));

      await expect(useCase.execute(mockDto, 'user-1')).rejects.toThrow(
        'DB Error',
      );

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
