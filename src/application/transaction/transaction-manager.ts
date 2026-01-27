// Transaction manager for database operations
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionManager {
    async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
        // TODO: Implement transaction handling
        return fn();
    }
}
