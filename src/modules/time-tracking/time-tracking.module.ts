import { Module } from '@nestjs/common';
import { TimeTrackingController } from './api/time-tracking.controller';
import { TimeTrackingService } from './application/time-tracking.service';
import { TimeEntriesRepository } from './infrastructure/time-entries.repository';
import { StartTimerUseCase } from './application/usecases/start-timer.usecase';
import { StopTimerUseCase } from './application/usecases/stop-timer.usecase';
import { ListEntriesUseCase } from './application/usecases/list-entries.usecase';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [EventEmitterModule.forRoot(), DatabaseModule],
  controllers: [TimeTrackingController],
  providers: [
    TimeTrackingService,
    TimeEntriesRepository,
    StartTimerUseCase,
    StopTimerUseCase,
    ListEntriesUseCase,
  ],
  exports: [TimeTrackingService],
})
export class TimeTrackingModule { }
