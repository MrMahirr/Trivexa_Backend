import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from '../api/dto/create-ticket.dto';
import { TicketQueryDto } from '../api/dto/ticket-query.dto';
import { CreateTicketUseCase } from './usecases/create-ticket.usecase';
import { ListTicketsUseCase } from './usecases/list-tickets.usecase';
import { GetTicketUseCase } from './usecases/get-ticket.usecase';
import { UpdateTicketStatusUseCase } from './usecases/update-ticket-status.usecase';
import { AssignTicketUseCase } from './usecases/assign-ticket.usecase';
import { ApproveTicketUseCase } from './usecases/approve-ticket.usecase';

@Injectable()
export class TicketsService {
  constructor(
    private readonly createUseCase: CreateTicketUseCase,
    private readonly listUseCase: ListTicketsUseCase,
    private readonly getUseCase: GetTicketUseCase,
    private readonly updateStatusUseCase: UpdateTicketStatusUseCase,
    private readonly assignUseCase: AssignTicketUseCase,
    private readonly approveUseCase: ApproveTicketUseCase,
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

  async assign(id: string, assigneeId: string, assignedBy: string) {
    return this.assignUseCase.execute(id, assigneeId, assignedBy);
  }

  async approve(id: string, approvedBy: string) {
    return this.approveUseCase.execute(id, approvedBy);
  }
}
