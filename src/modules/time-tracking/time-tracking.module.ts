import { Module } from '@nestjs/common';
import { TimeTrackingController } from './api/time-tracking.controller';
import { TimeTrackingService } from './application/time-tracking.service';
import { TimeEntryRepository } from './infrastructure/repositories/time-entry.repository';
import { StartTimerUseCase } from './application/usecases/start-timer.usecase';
import { StopTimerUseCase } from './application/usecases/stop-timer.usecase';
import { CancelEntryUseCase } from './application/usecases/cancel-entry.usecase';
import { ListTimeEntriesQuery } from './application/queries/list-time-entries.query';
import { TimeTrackingPublicService } from './public/time-tracking-public.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [EventEmitterModule.forRoot(), DatabaseModule],
  controllers: [TimeTrackingController],
  providers: [
    TimeTrackingService,
    TimeEntryRepository,
    StartTimerUseCase,
    StopTimerUseCase,
    CancelEntryUseCase,
    ListTimeEntriesQuery,
    TimeTrackingPublicService,
  ],
  exports: [TimeTrackingService, TimeTrackingPublicService],
})
export class TimeTrackingModule { }
