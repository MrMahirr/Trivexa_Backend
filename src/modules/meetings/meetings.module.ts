import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MeetingsController } from './api/meetings.controller';
import { MeetingsService } from './application/meetings.service';
import { MeetingsRepository } from './infrastructure/meetings.repository';

@Module({
  imports: [DatabaseModule],
  providers: [MeetingsService, MeetingsRepository],
  controllers: [MeetingsController],
  exports: [MeetingsService],
})
export class MeetingsModule {}
