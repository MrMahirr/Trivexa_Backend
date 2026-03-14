import { Injectable, Logger } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error';

import { TicketsRepository } from '../../infrastructure/tickets.repository';
import { TicketRules } from '../../domain/ticket.rules';

@Injectable()
export class UpdateTicketStatusUseCase {
  private readonly logger = new Logger(UpdateTicketStatusUseCase.name);

  constructor(private readonly ticketsRepo: TicketsRepository) {}

  async execute(id: string, status: string) {
    const ticket = await this.ticketsRepo.findById(id);
    if (!ticket) throw new NotFoundError();

    TicketRules.validateStatusTransition(ticket.status, status);

    const updated = await this.ticketsRepo.updateStatus(id, status);
    this.logger.log(`Ticket ${id} status: ${ticket.status} → ${status}`);
    return updated;
  }
}
