import { DomainError, DomainErrorType } from './domain.error';

export class ConflictError extends DomainError {
  constructor(message: string, details?: any) {
    super(message, DomainErrorType.CONFLICT, 'CONFLICT_ERROR');
  }
}
