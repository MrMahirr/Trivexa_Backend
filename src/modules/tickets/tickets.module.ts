import { Module } from '@nestjs/common';
import { TicketsController } from './api/tickets.controller';
import { TicketsService } from './application/tickets.service';
import { TicketsRepository } from './infrastructure/tickets.repository';

import { CreateTicketUseCase } from './application/usecases/create-ticket.usecase';
import { ListTicketsUseCase } from './application/usecases/list-tickets.usecase';
import { GetTicketUseCase } from './application/usecases/get-ticket.usecase';
import { UpdateTicketStatusUseCase } from './application/usecases/update-ticket-status.usecase';
import { AssignTicketUseCase } from './application/usecases/assign-ticket.usecase';

@Module({
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketsRepository,
    CreateTicketUseCase,
    ListTicketsUseCase,
    GetTicketUseCase,
    UpdateTicketStatusUseCase,
    AssignTicketUseCase,
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
