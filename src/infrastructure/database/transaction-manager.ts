import { Injectable, Logger } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../database/pool';

/**
 * Transaction Manager
 *
 * Provides robust transaction management with:
 * - Automatic rollback on error
 * - Nested transaction support (savepoints)
 * - Transaction timeout handling
 * - Connection pool management
 */
@Injectable()
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);
  private readonly DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

  constructor(private readonly dbPool: DatabasePool) {}

  /**
   * Execute a function within a transaction
   * Automatically handles BEGIN, COMMIT, ROLLBACK, and connection release
   */
  async executeInTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    timeoutMs: number = this.DEFAULT_TIMEOUT_MS,
  ): Promise<T> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    const transactionId = this.generateTransactionId();

    try {
      // Set transaction timeout
      await client.query(`SET statement_timeout = ${timeoutMs}`);

      // Begin transaction
      await client.query('BEGIN');
      this.logger.debug(`Transaction started: ${transactionId}`);

      // Execute callback
      const result = await callback(client);

      // Commit transaction
      await client.query('COMMIT');
      this.logger.debug(`Transaction committed: ${transactionId}`);

      return result;
    } catch (error) {
      // Rollback on any error
      await client.query('ROLLBACK');
      this.logger.error(
        `Transaction rolled back: ${transactionId}`,
        error.stack,
      );
      throw error;
    } finally {
      // Reset timeout and release connection
      await client.query('RESET statement_timeout').catch(() => {
        // Ignore errors on cleanup
      });
      client.release();
      this.logger.debug(`Transaction ended: ${transactionId}`);
    }
  }

  /**
   * Execute nested transactions using savepoints
   *
   * Example:
   * ```typescript
   * await transactionManager.executeInTransaction(async (client) => {
   *   await doSomething(client);
   *
   *   // Nested transaction
   *   await transactionManager.executeNestedTransaction(
   *     client,
   *     'savepoint_1',
   *     async () => {
   *       await doNestedOperation(client);
   *     }
   *   );
   *
   *   await doMoreThings(client);
   * });
   * ```
   */
  async executeNestedTransaction<T>(
    client: PoolClient,
    savepointName: string,
    callback: () => Promise<T>,
  ): Promise<T> {
    try {
      // Create savepoint
      await client.query(`SAVEPOINT ${savepointName}`);
      this.logger.debug(`Savepoint created: ${savepointName}`);

      // Execute nested operation
      const result = await callback();

      // Release savepoint on success
      await client.query(`RELEASE SAVEPOINT ${savepointName}`);
      this.logger.debug(`Savepoint released: ${savepointName}`);

      return result;
    } catch (error) {
      // Rollback to savepoint on error
      await client.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
      this.logger.warn(
        `Rolled back to savepoint: ${savepointName}`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Execute multiple operations in parallel within a transaction
   * All operations share the same transaction context
   */
  async executeParallelInTransaction<T>(
    operations: Array<(client: PoolClient) => Promise<T>>,
    timeoutMs: number = this.DEFAULT_TIMEOUT_MS,
  ): Promise<T[]> {
    return this.executeInTransaction(async (client) => {
      return Promise.all(operations.map((op) => op(client)));
    }, timeoutMs);
  }

  /**
   * Check if a transaction is still active
   */
  async isTransactionActive(client: PoolClient): Promise<boolean> {
    try {
      const result = await client.query(
        'SELECT current_setting($1, true) AS status',
        ['transaction_read_only'],
      );
      return result.rows[0]?.status !== null;
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique transaction ID for logging
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
