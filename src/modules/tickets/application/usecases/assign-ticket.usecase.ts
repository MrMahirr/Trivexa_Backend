import { Injectable, Logger } from '@nestjs/common';
import { TicketsRepository } from '../../infrastructure/tickets.repository';
import { TicketNotFoundException } from '../../domain/ticket.rules';

@Injectable()
export class AssignTicketUseCase {
    private readonly logger = new Logger(AssignTicketUseCase.name);

    constructor(private readonly ticketsRepo: TicketsRepository) { }

    async execute(id: string, assigneeId: string) {
        const ticket = await this.ticketsRepo.findById(id);
        if (!ticket) throw new TicketNotFoundException();

        const updated = await this.ticketsRepo.assign(id, assigneeId);
        this.logger.log(`Ticket ${id} assigned to ${assigneeId}`);
        return updated;
    }
}
