// Permission error
import { DomainError } from './domain-error.base';

export class PermissionError extends DomainError {
  readonly code = 'PERMISSION_DENIED';

  constructor(message: string = 'Permission denied') {
    super(message);
  }
}
