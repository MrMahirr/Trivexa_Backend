import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MeetingsController } from './api/meetings.controller';
import { MeetingsService } from './application/meetings.service';
import { MeetingsRepository } from './infrastructure/meetings.repository';
import { CreateMeetingUseCase } from './application/usecases/create-meeting.usecase';
import { ConvertToTicketUseCase } from './application/usecases/convert-to-ticket.usecase';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [DatabaseModule, TicketsModule],
  providers: [
    MeetingsService,
    MeetingsRepository,
    CreateMeetingUseCase,
    ConvertToTicketUseCase
  ],
  controllers: [MeetingsController],
  exports: [MeetingsService],
})
export class MeetingsModule { }
