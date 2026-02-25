import { Injectable, ConflictException } from '@nestjs/common';
import { TimeEntriesRepository } from '../../infrastructure/time-entries.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class StartTimerUseCase {
    constructor(
        private readonly timeEntriesRepo: TimeEntriesRepository,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(userId: string, projectId?: string, taskId?: string, description?: string) {
        const activeTimer = await this.timeEntriesRepo.findActiveTimer(userId);
        if (activeTimer) {
            throw new ConflictException('You already have an active timer. Please stop it before starting a new one.');
        }

        const newTimer = await this.timeEntriesRepo.start(userId, projectId, taskId, description);

        this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
            action: 'timer_started',
            entity: 'TIME_ENTRY',
            entityId: newTimer.id,
            userId: userId,
            details: { projectId, taskId }
        });

        return newTimer;
    }
}
