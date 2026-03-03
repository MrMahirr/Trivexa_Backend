import { DomainError } from './domain.error';

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 'FORBIDDEN_ERROR', details);
  }
}
