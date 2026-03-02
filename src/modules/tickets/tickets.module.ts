import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { TicketsController } from './api/tickets.controller';
import { TicketsService } from './application/tickets.service';
import { TicketsRepository } from './infrastructure/tickets.repository';

import { CreateTicketUseCase } from './application/usecases/create-ticket.usecase';
import { ListTicketsUseCase } from './application/usecases/list-tickets.usecase';
import { GetTicketUseCase } from './application/usecases/get-ticket.usecase';
import { UpdateTicketStatusUseCase } from './application/usecases/update-ticket-status.usecase';
import { AssignTicketUseCase } from './application/usecases/assign-ticket.usecase';
import { ApproveTicketUseCase } from './application/usecases/approve-ticket.usecase';
import { TicketsPublicService } from './public/tickets-public.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketsRepository,
    CreateTicketUseCase,
    ListTicketsUseCase,
    GetTicketUseCase,
    UpdateTicketStatusUseCase,
    AssignTicketUseCase,
    ApproveTicketUseCase,
    TicketsPublicService,
  ],
  exports: [TicketsService, CreateTicketUseCase, TicketsPublicService],
})
export class TicketsModule {}
