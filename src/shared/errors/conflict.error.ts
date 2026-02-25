import { DomainError } from './domain.error';

export class ConflictError extends DomainError {
    constructor(message: string, details?: any) {
        super(message, 'CONFLICT_ERROR', details);
    }
}
