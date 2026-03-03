import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesRepository } from './invoices.repository';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { InvoiceStatus } from '../domain/invoice.entity';

describe('InvoicesRepository', () => {
  let repository: InvoicesRepository;
  let dbPool: Partial<DatabasePool>;
  let mockClient: any;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesRepository,
        { provide: DatabasePool, useValue: dbPool },
      ],
    }).compile();

    repository = module.get<InvoicesRepository>(InvoicesRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should insert invoice and items', async () => {
      const mockInvoiceRow = {
        id: 'inv-1',
        invoice_number: 'INV-001',
        client_id: 'c1',
        status: 'DRAFT',
        subtotal: '1000',
        tax_rate: '18',
        tax_amount: '180',
        total: '1180',
        issue_date: new Date(),
        created_by: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockItemRow = {
        id: 'item-1',
        invoice_id: 'inv-1',
        description: 'Service',
        quantity: '2',
        unit_price: '500',
        total: '1000',
      };

      const queryOneSpy = jest
        .spyOn(BaseQuery, 'queryOne')
        .mockResolvedValueOnce(mockInvoiceRow) // invoice insert
        .mockResolvedValueOnce(mockItemRow); // item insert

      const invoiceData = {
        invoiceNumber: 'INV-001',
        clientId: 'c1',
        status: InvoiceStatus.DRAFT,
        subtotal: 1000,
        taxRate: 18,
        taxAmount: 180,
        total: 1180,
        issueDate: new Date(),
        createdBy: 'user-1',
      };

      const items = [{ description: 'Service', quantity: 2, unitPrice: 500 }];

      const result = await repository.create(invoiceData, items, mockClient);

      expect(result.id).toBe('inv-1');
      expect(result.invoiceNumber).toBe('INV-001');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].description).toBe('Service');
      expect(queryOneSpy).toHaveBeenCalledTimes(2);
    });

    it('should create invoice without items when items array is empty', async () => {
      const mockInvoiceRow = {
        id: 'inv-2',
        invoice_number: 'INV-002',
        client_id: 'c1',
        status: 'DRAFT',
        subtotal: '0',
        tax_rate: '20',
        tax_amount: '0',
        total: '0',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockInvoiceRow);

      const result = await repository.create(
        { invoiceNumber: 'INV-002' },
        [],
        mockClient,
      );

      expect(result.id).toBe('inv-2');
      expect(result.items).toEqual([]);
      // queryOne called only once (for invoice, not items)
      expect(BaseQuery.queryOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return invoice with items if found', async () => {
      const mockInvoiceRow = {
        id: 'inv-1',
        invoice_number: 'INV-001',
        client_id: 'c1',
        status: 'PAID',
        subtotal: '1000',
        tax_rate: '18',
        tax_amount: '180',
        total: '1180',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockItemRows = [
        {
          id: 'item-1',
          invoice_id: 'inv-1',
          description: 'A',
          quantity: '1',
          unit_price: '500',
          total: '500',
        },
        {
          id: 'item-2',
          invoice_id: 'inv-1',
          description: 'B',
          quantity: '1',
          unit_price: '500',
          total: '500',
        },
      ];

      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockInvoiceRow);
      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue(mockItemRows);

      const result = await repository.findById('inv-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('inv-1');
      expect(result?.items).toHaveLength(2);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null if not found', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated invoice', async () => {
      const mockRow = {
        id: 'inv-1',
        invoice_number: 'INV-001',
        status: 'PAID',
        subtotal: '1000',
        tax_rate: '18',
        tax_amount: '180',
        total: '1180',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

      const result = await repository.updateStatus(
        'inv-1',
        InvoiceStatus.PAID,
        mockClient,
      );

      expect(result).toBeDefined();
      expect(result?.status).toBe(InvoiceStatus.PAID);
      expect(BaseQuery.queryOne).toHaveBeenCalledWith(
        mockClient,
        expect.any(String),
        [InvoiceStatus.PAID, 'inv-1'],
      );
    });

    it('should return null if invoice not found', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

      const result = await repository.updateStatus(
        'non-existent',
        InvoiceStatus.PAID,
        mockClient,
      );

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return invoices with pagination', async () => {
      const mockRows = [
        {
          id: 'inv-1',
          invoice_number: 'INV-001',
          status: 'DRAFT',
          subtotal: '100',
          tax_rate: '20',
          tax_amount: '20',
          total: '120',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'inv-2',
          invoice_number: 'INV-002',
          status: 'PAID',
          subtotal: '200',
          tax_rate: '20',
          tax_amount: '40',
          total: '240',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue(mockRows);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result).toHaveLength(2);
      expect(result[0].invoiceNumber).toBe('INV-001');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);

      await repository.findAll({
        page: 1,
        limit: 10,
        status: InvoiceStatus.PAID,
      });

      expect(BaseQuery.queryMany).toHaveBeenCalledWith(
        mockClient,
        expect.stringContaining('status'),
        expect.arrayContaining([InvoiceStatus.PAID]),
      );
    });
  });

  describe('countInvoicesByYear', () => {
    it('should return count for given year', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ count: '42' });

      const count = await repository.countInvoicesByYear(2026);

      expect(count).toBe(42);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('sumByDateRange', () => {
    it('should return totals for date range', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({
        total_issued: '50000.00',
        total_collected: '35000.00',
      });

      const start = new Date('2026-01-01');
      const end = new Date('2026-12-31');
      const result = await repository.sumByDateRange(start, end);

      expect(result.totalIssued).toBe(50000);
      expect(result.totalCollected).toBe(35000);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
