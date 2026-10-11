import {
  DomainError,
  DomainErrorType,
} from '../../../shared/errors/domain.error';

export const TICKET_STATUS_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['IN_PROGRESS', 'CLOSED', 'RESOLVED'], // Admin/Manager can resolve immediately
  IN_PROGRESS: ['RESOLVED', 'CLOSED', 'OPEN'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'], // Reopen if not satisfied
  CLOSED: ['OPEN'], // Reopen
};

export class TicketRules {
  static validateStatusTransition(from: string, to: string): void {
    const allowed = TICKET_STATUS_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
      throw new DomainError(
        `Cannot change ticket status from '${from}' to '${to}'. Allowed: ${allowed?.join(', ') || 'none'}`,
        DomainErrorType.BUSINESS_RULE,
      );
    }
  }
}

export class TicketNotFoundException extends DomainError {
  constructor() {
    super('Ticket not found');
  }
}
