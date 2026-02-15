import { Module } from '@nestjs/common';
import { TicketsController } from './api/tickets.controller';
import { TicketsService } from './application/tickets.service';
import { TicketsRepository } from './infrastructure/tickets.repository';

@Module({
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository],
    exports: [TicketsService],
})
export class TicketsModule { }
