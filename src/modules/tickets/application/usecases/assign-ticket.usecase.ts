import { Injectable, Logger } from '@nestjs/common';

import { TicketsRepository } from '../../infrastructure/tickets.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { NotFoundError } from "../../../../shared/errors/not-found.error";

@Injectable()
export class AssignTicketUseCase {
  private readonly logger = new Logger(AssignTicketUseCase.name);

  constructor(
    private readonly ticketsRepo: TicketsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(ticketId: string, assigneeId: string, assignedBy: string) {
    const ticket = await this.ticketsRepo.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    const updated = await this.ticketsRepo.assign(ticketId, assigneeId);

    // Otomatik olarak status IN_PROGRESS yapılabilir veya aynı bırakılır. Biz durumunu güncelleyelim.
    if (ticket.status === 'OPEN') {
      await this.ticketsRepo.updateStatus(ticketId, 'IN_PROGRESS');
      if (updated) updated.status = 'IN_PROGRESS';
    }

    this.logger.log(
      `Ticket ${ticketId} assigned to ${assigneeId} by ${assignedBy}`,
    );

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'ticket_assigned',
      entity: 'TICKET',
      entityId: ticketId,
      userId: assignedBy,
      details: { assigneeId },
    });

    return updated;
  }
}
