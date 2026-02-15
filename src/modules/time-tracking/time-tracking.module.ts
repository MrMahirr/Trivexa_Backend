import { Module } from '@nestjs/common';
import { TimeTrackingController } from './api/time-tracking.controller';
import { TimeTrackingService } from './application/time-tracking.service';
import { TimeEntriesRepository } from './infrastructure/time-entries.repository';

@Module({
    controllers: [TimeTrackingController],
    providers: [TimeTrackingService, TimeEntriesRepository],
    exports: [TimeTrackingService],
})
export class TimeTrackingModule { }
