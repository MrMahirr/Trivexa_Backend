import { Injectable } from '@nestjs/common';
import { TicketsRepository } from '../../infrastructure/tickets.repository';
import { TicketQueryDto } from '../../api/dto/ticket-query.dto';

@Injectable()
export class ListTicketsUseCase {
    constructor(private readonly ticketsRepo: TicketsRepository) { }

    async execute(query: TicketQueryDto, userId: string, role: string) {
        // ADMIN/MANAGER see all, others see own (created or assigned)
        const filterUserId = (role === 'ADMIN' || role === 'MANAGER') ? undefined : userId;
        return this.ticketsRepo.findAll(query, filterUserId);
    }
}
