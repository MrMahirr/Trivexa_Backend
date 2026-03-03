import { Injectable } from '@nestjs/common';
import { TicketsRepository } from '../infrastructure/tickets.repository';
import { TicketEntity } from '../domain/ticket.entity';

@Injectable()
export class TicketsPublicService {
  constructor(private readonly ticketsRepo: TicketsRepository) {}

  async findById(id: string): Promise<TicketEntity | null> {
    return this.ticketsRepo.findById(id);
  }

  async exists(id: string): Promise<boolean> {
    const ticket = await this.ticketsRepo.findById(id);
    return !!ticket;
  }
}
