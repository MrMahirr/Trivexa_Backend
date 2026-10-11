import { Test, TestingModule } from '@nestjs/testing';
import { TransactionManager } from './transaction-manager';
import { DatabasePool } from './pool';
import { PoolClient } from 'pg';

describe('TransactionManager', () => {
  let transactionManager: TransactionManager;
  let mockDbPool: jest.Mocked<DatabasePool>;
  let mockClient: jest.Mocked<PoolClient>;

  beforeEach(async () => {
    // Mock PoolClient
    mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    } as any;

    // Mock DatabasePool
    mockDbPool = {
      getPool: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(mockClient),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionManager,
        {
          provide: DatabasePool,
          useValue: mockDbPool,
        },
      ],
    }).compile();

    transactionManager = module.get<TransactionManager>(TransactionManager);
  });

  describe('executeInTransaction', () => {
    it('should execute callback and commit transaction on success', async () => {
      const callback = jest.fn().mockResolvedValue('result');

      const result = await transactionManager.executeInTransaction(callback);

      expect(result).toBe('result');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SET statement_timeout'),
      );
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const error = new Error('Test error');
      const callback = jest.fn().mockRejectedValue(error);

      await expect(
        transactionManager.executeInTransaction(callback),
      ).rejects.toThrow(error);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release connection even if rollback fails', async () => {
      const error = new Error('Test error');
      const callback = jest.fn().mockRejectedValue(error);
      mockClient.query.mockImplementation((query: string) => {
        if (query === 'ROLLBACK') {
          return Promise.reject(new Error('Rollback failed'));
        }
        return Promise.resolve({ rows: [] } as any);
      });

      await expect(
        transactionManager.executeInTransaction(callback),
      ).rejects.toThrow();

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should set custom timeout', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      const customTimeout = 60000;

      await transactionManager.executeInTransaction(callback, customTimeout);

      expect(mockClient.query).toHaveBeenCalledWith(
        `SET statement_timeout = ${customTimeout}`,
      );
    });
  });

  describe('executeNestedTransaction', () => {
    it('should create and release savepoint on success', async () => {
      const callback = jest.fn().mockResolvedValue('nested result');
      const savepointName = 'sp1';

      const result = await transactionManager.executeNestedTransaction(
        mockClient,
        savepointName,
        callback,
      );

      expect(result).toBe('nested result');
      expect(mockClient.query).toHaveBeenCalledWith(
        `SAVEPOINT ${savepointName}`,
      );
      expect(callback).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        `RELEASE SAVEPOINT ${savepointName}`,
      );
    });

    it('should rollback to savepoint on error', async () => {
      const error = new Error('Nested error');
      const callback = jest.fn().mockRejectedValue(error);
      const savepointName = 'sp1';

      await expect(
        transactionManager.executeNestedTransaction(
          mockClient,
          savepointName,
          callback,
        ),
      ).rejects.toThrow(error);

      expect(mockClient.query).toHaveBeenCalledWith(
        `SAVEPOINT ${savepointName}`,
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        `ROLLBACK TO SAVEPOINT ${savepointName}`,
      );
    });
  });

  describe('executeParallelInTransaction', () => {
    it('should execute multiple operations in parallel', async () => {
      const op1 = jest.fn().mockResolvedValue('result1');
      const op2 = jest.fn().mockResolvedValue('result2');
      const op3 = jest.fn().mockResolvedValue('result3');

      const results = await transactionManager.executeParallelInTransaction([
        op1,
        op2,
        op3,
      ]);

      expect(results).toEqual(['result1', 'result2', 'result3']);
      expect(op1).toHaveBeenCalledWith(mockClient);
      expect(op2).toHaveBeenCalledWith(mockClient);
      expect(op3).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback all operations if one fails', async () => {
      const op1 = jest.fn().mockResolvedValue('result1');
      const op2 = jest.fn().mockRejectedValue(new Error('Op2 failed'));
      const op3 = jest.fn().mockResolvedValue('result3');

      await expect(
        transactionManager.executeParallelInTransaction([op1, op2, op3]),
      ).rejects.toThrow('Op2 failed');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('isTransactionActive', () => {
    it('should return true if transaction is active', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ status: 'on' }],
      } as any);

      const result = await transactionManager.isTransactionActive(mockClient);

      expect(result).toBe(true);
    });

    it('should return false if transaction is not active', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ status: null }],
      } as any);

      const result = await transactionManager.isTransactionActive(mockClient);

      expect(result).toBe(false);
    });

    it('should return false on query error', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      const result = await transactionManager.isTransactionActive(mockClient);

      expect(result).toBe(false);
    });
  });
});
