import { Injectable, Logger } from '@nestjs/common';
import { TicketsRepository } from '../infrastructure/tickets.repository';
import { CreateTicketDto } from '../api/dto/create-ticket.dto';
import { TicketQueryDto } from '../api/dto/ticket-query.dto';
import { TicketRules, TicketNotFoundException } from '../domain/ticket.rules';
import { CreateTicketUseCase } from './usecases/create-ticket.usecase';
import { ListTicketsUseCase } from './usecases/list-tickets.usecase';
import { GetTicketUseCase } from './usecases/get-ticket.usecase';
import { UpdateTicketStatusUseCase } from './usecases/update-ticket-status.usecase';
import { AssignTicketUseCase } from './usecases/assign-ticket.usecase';

@Injectable()
export class TicketsService {
    constructor(
        private readonly createUseCase: CreateTicketUseCase,
        private readonly listUseCase: ListTicketsUseCase,
        private readonly getUseCase: GetTicketUseCase,
        private readonly updateStatusUseCase: UpdateTicketStatusUseCase,
        private readonly assignUseCase: AssignTicketUseCase,
    ) { }

    async create(dto: CreateTicketDto, userId: string) {
        return this.createUseCase.execute(dto, userId);
    }

    async findAll(query: TicketQueryDto, userId: string, role: string) {
        return this.listUseCase.execute(query, userId, role);
    }

    async findById(id: string) {
        return this.getUseCase.execute(id);
    }

    async updateStatus(id: string, status: string) {
        return this.updateStatusUseCase.execute(id, status);
    }

    async assign(id: string, assigneeId: string) {
        return this.assignUseCase.execute(id, assigneeId);
    }
}
