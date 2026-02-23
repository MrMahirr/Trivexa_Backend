import { Injectable, Logger } from '@nestjs/common';
import { TicketsRepository } from '../../infrastructure/tickets.repository';
import { CreateTicketDto } from '../../api/dto/create-ticket.dto';

@Injectable()
export class CreateTicketUseCase {
  private readonly logger = new Logger(CreateTicketUseCase.name);

  constructor(private readonly ticketsRepo: TicketsRepository) {}

  async execute(dto: CreateTicketDto, userId: string) {
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
}
