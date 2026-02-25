import { DomainError } from './domain.error';

export class NotFoundError extends DomainError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(message, 'NOT_FOUND_ERROR', details);
    }
}
