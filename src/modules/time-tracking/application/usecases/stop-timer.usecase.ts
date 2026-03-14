import { Injectable } from '@nestjs/common';

import { TimeEntryRepository } from '../../infrastructure/repositories/time-entry.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { StopTimerDto } from '../../api/dto/stop-timer.dto';
import { NotFoundError } from "../../../../shared/errors/not-found.error";

@Injectable()
export class StopTimerUseCase {
  constructor(
    private readonly timeEntriesRepo: TimeEntryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, dto: StopTimerDto) {
    const activeTimer = await this.timeEntriesRepo.findActiveTimer(userId);
    if (!activeTimer) {
      throw new NotFoundError('No active timer found to stop.');
    }

    const endTime = new Date();
    const startTime = new Date(activeTimer.startTime);

    // Calculate minutes
    const diffMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(diffMs / 60000);

    const stoppedTimer = await this.timeEntriesRepo.stopTimer(
      activeTimer.id,
      endTime,
      durationMinutes,
      dto.description,
    );

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'timer_stopped',
      entity: 'TIME_ENTRY',
      entityId: stoppedTimer.id,
      userId: userId,
      details: { durationMinutes },
    });

    return stoppedTimer;
  }
}
