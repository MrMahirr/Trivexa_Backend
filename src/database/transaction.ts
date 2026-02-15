import { Injectable, Logger } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from './pool';

@Injectable()
export class TransactionManager {
    private readonly logger = new Logger(TransactionManager.name);

    constructor(private readonly dbPool: DatabasePool) { }

    async run<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.dbPool.getPool().connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Transaction failed, rolled back', error.stack);
            throw error;
        } finally {
            client.release();
        }
    }
}
