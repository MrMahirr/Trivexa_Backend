import { DomainError, DomainErrorType } from './domain.error';

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, DomainErrorType.FORBIDDEN, 'FORBIDDEN_ERROR');
  }
}
