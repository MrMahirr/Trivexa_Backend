import { Injectable } from '@nestjs/common';
import { TicketsRepository } from '../../infrastructure/tickets.repository';
import { TicketNotFoundException } from '../../domain/ticket.rules';

@Injectable()
export class GetTicketUseCase {
    constructor(private readonly ticketsRepo: TicketsRepository) { }

    async execute(id: string) {
        const ticket = await this.ticketsRepo.findById(id);
        if (!ticket) throw new TicketNotFoundException();
        return ticket;
    }
}
