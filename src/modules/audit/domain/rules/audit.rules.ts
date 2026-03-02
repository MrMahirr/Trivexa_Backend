import { DomainError } from '../../../../shared/errors/domain.error';

export class InvalidAuditActionError extends DomainError {
  constructor(action: string) {
    super(`Invalid audit action '${action}'.`, 'INVALID_AUDIT_ACTION');
  }
}

export class AuditRules {
  static readonly VALID_ACTIONS = [
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'OTHER',
  ];

  static validateAction(action: string): void {
    if (!this.VALID_ACTIONS.includes(action)) {
      throw new InvalidAuditActionError(action);
    }
  }
}
