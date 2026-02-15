import { Injectable, Logger } from '@nestjs/common';
import { TicketsRepository } from '../infrastructure/tickets.repository';
import { CreateTicketDto } from '../api/dto/create-ticket.dto';
import { TicketQueryDto } from '../api/dto/ticket-query.dto';
import { TicketRules, TicketNotFoundException } from '../domain/ticket.rules';

@Injectable()
export class TicketsService {
    private readonly logger = new Logger(TicketsService.name);

    constructor(private readonly ticketsRepo: TicketsRepository) { }

    async create(dto: CreateTicketDto, userId: string) {
        const ticket = await this.ticketsRepo.create({
            subject: dto.subject,
            description: dto.description,
            type: dto.type || 'SUPPORT',
            priority: dto.priority || 'MEDIUM',
            createdBy: userId,
        });
        this.logger.log(`Ticket created: ${ticket.subject} by ${userId}`);
        return ticket;
    }

    async findAll(query: TicketQueryDto, userId: string, role: string) {
        // ADMIN/MANAGER see all, others see own (created or assigned)
        const filterUserId = (role === 'ADMIN' || role === 'MANAGER') ? undefined : userId;
        return this.ticketsRepo.findAll(query, filterUserId);
    }

    async findById(id: string) {
        const ticket = await this.ticketsRepo.findById(id);
        if (!ticket) throw new TicketNotFoundException();
        return ticket;
    }

    async updateStatus(id: string, status: string) {
        const ticket = await this.ticketsRepo.findById(id);
        if (!ticket) throw new TicketNotFoundException();

        TicketRules.validateStatusTransition(ticket.status, status);

        const updated = await this.ticketsRepo.updateStatus(id, status);
        this.logger.log(`Ticket ${id} status: ${ticket.status} → ${status}`);
        return updated;
    }

    async assign(id: string, assigneeId: string) {
        const ticket = await this.ticketsRepo.findById(id);
        if (!ticket) throw new TicketNotFoundException();

        const updated = await this.ticketsRepo.assign(id, assigneeId);
        this.logger.log(`Ticket ${id} assigned to ${assigneeId}`);
        return updated;
    }
}
