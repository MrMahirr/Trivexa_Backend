import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeEntriesRepository } from '../../infrastructure/time-entries.repository';
import { TimeTrackingRules } from '../../domain/rules/time-tracking.rules';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class StopTimerUseCase {
    constructor(
        private readonly timeEntriesRepo: TimeEntriesRepository,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(userId: string) {
        const activeTimer = await this.timeEntriesRepo.findActiveTimer(userId);
        if (!activeTimer) {
            throw new NotFoundException('No active timer found to stop.');
        }

        const stoppedTimer = await this.timeEntriesRepo.stop(activeTimer.id);

        this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
            action: 'timer_stopped',
            entity: 'TIME_ENTRY',
            entityId: stoppedTimer!.id,
            userId: userId
        });

        return stoppedTimer;
    }
}
