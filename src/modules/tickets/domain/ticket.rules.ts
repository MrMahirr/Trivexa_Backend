import { HttpException, HttpStatus } from '@nestjs/common';

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
            throw new HttpException(
                `Cannot change ticket status from '${from}' to '${to}'. Allowed: ${allowed?.join(', ') || 'none'}`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}

export class TicketNotFoundException extends HttpException {
    constructor() {
        super('Ticket not found', HttpStatus.NOT_FOUND);
    }
}
