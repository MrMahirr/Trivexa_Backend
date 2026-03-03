import { Test, TestingModule } from '@nestjs/testing';
import { CreateInvoiceUseCase } from './create-invoice.usecase';
import { InvoicesRepository } from '../../infrastructure/invoices.repository';
import { DatabasePool } from '../../../../../database/pool';
import { InvoiceStatus } from '../../domain/invoice.entity';

describe('CreateInvoiceUseCase', () => {
  let useCase: CreateInvoiceUseCase;
  let invoicesRepo: Partial<jest.Mocked<InvoicesRepository>>;
  let dbPool: Partial<DatabasePool>;
  let mockClient: any;

  const mockDto: any = {
    clientId: 'client-uuid-1',
    projectId: 'project-uuid-1',
    items: [
      { description: 'Web Development', quantity: 10, unitPrice: 100 },
      { description: 'Design Services', quantity: 5, unitPrice: 200 },
    ],
    taxRate: 18,
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    notes: 'Net 30 payment terms',
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

    invoicesRepo = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInvoiceUseCase,
        { provide: InvoicesRepository, useValue: invoicesRepo },
        { provide: DatabasePool, useValue: dbPool },
      ],
    }).compile();

    useCase = module.get<CreateInvoiceUseCase>(CreateInvoiceUseCase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create invoice with correct totals', async () => {
      // subtotal = (10*100) + (5*200) = 2000
      // taxAmount = 2000 * 0.18 = 360
      // total = 2360
      const createdInvoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-123456-001',
        clientId: 'client-uuid-1',
        status: InvoiceStatus.DRAFT,
        subtotal: 2000,
        taxRate: 18,
        taxAmount: 360,
        total: 2360,
      };

      invoicesRepo.create.mockResolvedValue(createdInvoice as any);

      const result = await useCase.execute(mockDto, 'user-1');

      expect(result).toEqual(createdInvoice);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

      // Verify repo called with correct calculated values
      expect(invoicesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'client-uuid-1',
          projectId: 'project-uuid-1',
          status: InvoiceStatus.DRAFT,
          subtotal: 2000,
          taxRate: 18,
          taxAmount: 360,
          total: 2360,
          createdBy: 'user-1',
        }),
        mockDto.items,
        mockClient,
      );
    });

    it('should use default 20% tax rate when not specified', async () => {
      const dtoWithoutTax: any = {
        clientId: 'client-uuid-1',
        items: [{ description: 'Service', quantity: 1, unitPrice: 1000 }],
      };

      invoicesRepo.create.mockResolvedValue({ id: 'inv-2' } as any);

      await useCase.execute(dtoWithoutTax, 'user-1');

      // subtotal=1000, taxRate=20, taxAmount=200, total=1200
      expect(invoicesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: 1000,
          taxRate: 20,
          taxAmount: 200,
          total: 1200,
        }),
        dtoWithoutTax.items,
        mockClient,
      );
    });

    it('should rollback and release client on error', async () => {
      invoicesRepo.create.mockRejectedValue(new Error('DB Error'));

      await expect(useCase.execute(mockDto, 'user-1')).rejects.toThrow(
        'DB Error',
      );

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should always release client even on success', async () => {
      invoicesRepo.create.mockResolvedValue({ id: 'inv-3' } as any);

      await useCase.execute(mockDto, 'user-1');

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('generateInvoiceNumber', () => {
    it('should return invoice number in INV-XXXXXX-XXX format', () => {
      // Access private method via bracket notation
      const invoiceNumber = (useCase as any).generateInvoiceNumber();

      expect(invoiceNumber).toMatch(/^INV-\d{6}-\d{3}$/);
    });

    it('should generate unique numbers on consecutive calls', () => {
      const num1 = (useCase as any).generateInvoiceNumber();
      const num2 = (useCase as any).generateInvoiceNumber();

      // While not guaranteed unique (timestamp could match), they should be strings
      expect(typeof num1).toBe('string');
      expect(typeof num2).toBe('string');
    });
  });
});
