import {
  Injectable,
  Logger,
  } from '@nestjs/common';
import { TicketsRepository } from '../../infrastructure/tickets.repository';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { NotFoundError } from "../../../../shared/errors/not-found.error";
import { DomainError, DomainErrorType } from "../../../../shared/errors/domain.error";

@Injectable()
export class ApproveTicketUseCase {
  private readonly logger = new Logger(ApproveTicketUseCase.name);

  constructor(
    private readonly ticketsRepo: TicketsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(ticketId: string, approvedBy: string) {
    const ticket = await this.ticketsRepo.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      throw new DomainError('Ticket is already resolved or closed', DomainErrorType.BUSINESS_RULE);
    }

    const updated = await this.ticketsRepo.updateStatus(ticketId, 'RESOLVED');

    this.logger.log(`Ticket ${ticketId} approved/resolved by ${approvedBy}`);

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'ticket_resolved',
      entity: 'TICKET',
      entityId: ticketId,
      userId: approvedBy,
    });

    return updated;
  }
}
