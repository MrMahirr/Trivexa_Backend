import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentsService } from './payments.service';
import { DatabasePool } from '../../../../database/pool';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { InvoicesRepository } from '../../invoices/infrastructure/invoices.repository';
import { ProcessPaymentUseCase } from './usecases/process-payment.usecase';
import { ListPaymentsByInvoiceUseCase } from './usecases/list-payments-by-invoice.usecase';
import { InvoiceStatus } from '../../invoices/domain/invoice.entity';
import { PaymentMethod } from '../domain/payment.entity';
import { SystemEvents } from '../../../../shared/events/event.constants';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepo: Partial<jest.Mocked<PaymentsRepository>>;
  let invoicesRepo: Partial<jest.Mocked<InvoicesRepository>>;
  let processPaymentUseCase: Partial<jest.Mocked<ProcessPaymentUseCase>>;
  let listPaymentsUseCase: Partial<jest.Mocked<ListPaymentsByInvoiceUseCase>>;
  let eventEmitter: Partial<jest.Mocked<EventEmitter2>>;
  let mockClient: any;

  beforeEach(async () => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    paymentsRepo = {
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
      sumPaymentsByInvoiceId: jest.fn(),
      findAuditByInvoiceId: jest.fn(),
      findUserIdsByRoles: jest.fn().mockResolvedValue(['admin-1', 'manager-1']),
      findUserDisplayNameById: jest.fn().mockResolvedValue('Admin User'),
    };

    invoicesRepo = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    processPaymentUseCase = {
      execute: jest.fn(),
    };

    listPaymentsUseCase = {
      execute: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: DatabasePool,
          useValue: {
            getPool: jest.fn().mockReturnValue({
              connect: jest.fn().mockResolvedValue(mockClient),
            }),
          },
        },
        { provide: PaymentsRepository, useValue: paymentsRepo },
        { provide: InvoicesRepository, useValue: invoicesRepo },
        { provide: ProcessPaymentUseCase, useValue: processPaymentUseCase },
        {
          provide: ListPaymentsByInvoiceUseCase,
          useValue: listPaymentsUseCase,
        },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should emit audit event on create', async () => {
    const payment: any = {
      id: 'pay-1',
      invoiceId: 'inv-1',
      amount: 500,
      method: PaymentMethod.BANK_TRANSFER,
      paymentDate: new Date('2026-03-08'),
      reference: 'REF-1',
      notes: 'note',
      receiptUrl: null,
    };

    processPaymentUseCase.execute!.mockResolvedValue(payment);

    const result = await service.create(
      {
        invoiceId: 'inv-1',
        amount: 500,
        method: PaymentMethod.BANK_TRANSFER,
      } as any,
      'user-1',
    );

    expect(result).toEqual(payment);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      SystemEvents.AUDIT_LOG_CREATED,
      expect.objectContaining({
        entityName: 'PAYMENT',
        entityId: 'pay-1',
        action: 'CREATE',
        userId: 'user-1',
      }),
    );
  });

  it('should emit audit event on update', async () => {
    paymentsRepo.findById!.mockResolvedValue({
      id: 'pay-1',
      invoiceId: 'inv-1',
      amount: 400,
      method: PaymentMethod.CASH,
      paymentDate: new Date('2026-03-01'),
      reference: 'OLD',
      notes: 'old',
      receiptUrl: null,
    } as any);
    paymentsRepo.update!.mockResolvedValue({
      id: 'pay-1',
      invoiceId: 'inv-1',
      amount: 450,
      method: PaymentMethod.BANK_TRANSFER,
      paymentDate: new Date('2026-03-02'),
      reference: 'NEW',
      notes: 'new',
      receiptUrl: null,
    } as any);
    invoicesRepo.findById!.mockResolvedValue({
      id: 'inv-1',
      total: 1000,
      status: InvoiceStatus.SENT,
    } as any);
    paymentsRepo.sumPaymentsByInvoiceId!.mockResolvedValue(450);

    const updated = await service.update(
      'pay-1',
      { amount: 450, reference: 'NEW' } as any,
      'user-2',
    );

    expect(updated.amount).toBe(450);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      SystemEvents.AUDIT_LOG_CREATED,
      expect.objectContaining({
        entityId: 'pay-1',
        action: 'UPDATE',
        userId: 'user-2',
      }),
    );
  });

  it('should emit audit + payment deleted events on remove', async () => {
    paymentsRepo.findById!.mockResolvedValue({
      id: 'pay-2',
      invoiceId: 'inv-2',
      amount: 300,
      method: PaymentMethod.CASH,
      paymentDate: new Date('2026-03-03'),
    } as any);
    paymentsRepo.remove!.mockResolvedValue(true);
    invoicesRepo.findById!.mockResolvedValue({
      id: 'inv-2',
      total: 1000,
      status: InvoiceStatus.PARTIALLY_PAID,
    } as any);
    paymentsRepo.sumPaymentsByInvoiceId!.mockResolvedValue(0);

    await service.remove('pay-2', 'admin-1');

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      SystemEvents.AUDIT_LOG_CREATED,
      expect.objectContaining({
        entityId: 'pay-2',
        action: 'DELETE',
      }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      SystemEvents.PAYMENT_DELETED,
      expect.objectContaining({
        paymentId: 'pay-2',
        actorUserId: 'admin-1',
      }),
    );
  });

  it('should emit audit + payment refund events on refund', async () => {
    paymentsRepo.findById!.mockResolvedValue({
      id: 'pay-3',
      invoiceId: 'inv-3',
      amount: 800,
      method: PaymentMethod.BANK_TRANSFER,
      paymentDate: new Date('2026-03-02'),
      reference: 'PAY-3',
    } as any);
    paymentsRepo.create!.mockResolvedValue({
      id: 'refund-1',
      invoiceId: 'inv-3',
      amount: -200,
      method: PaymentMethod.BANK_TRANSFER,
      paymentDate: new Date('2026-03-08'),
      receiptUrl: null,
    } as any);
    invoicesRepo.findById!.mockResolvedValue({
      id: 'inv-3',
      total: 1000,
      status: InvoiceStatus.PARTIALLY_PAID,
    } as any);
    paymentsRepo.sumPaymentsByInvoiceId!.mockResolvedValue(600);

    const refund = await service.refund(
      'pay-3',
      { amount: 200, reason: 'test refund' } as any,
      'admin-1',
    );

    expect(refund.id).toBe('refund-1');
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      SystemEvents.AUDIT_LOG_CREATED,
      expect.objectContaining({
        entityId: 'refund-1',
        action: 'OTHER',
      }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      SystemEvents.PAYMENT_REFUND_CREATED,
      expect.objectContaining({
        refundPaymentId: 'refund-1',
        actorUserId: 'admin-1',
      }),
    );
  });
});
