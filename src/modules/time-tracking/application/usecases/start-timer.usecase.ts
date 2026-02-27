import { Injectable, ConflictException } from '@nestjs/common';
import { TimeEntryRepository } from '../../infrastructure/repositories/time-entry.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { StartTimerDto } from '../../api/dto/start-timer.dto';

@Injectable()
export class StartTimerUseCase {
    constructor(
        private readonly timeEntriesRepo: TimeEntryRepository,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(userId: string, dto: StartTimerDto) {
        const activeTimer = await this.timeEntriesRepo.findActiveTimer(userId);
        if (activeTimer) {
            throw new ConflictException('You already have an active timer. Please stop it before starting a new one.');
        }

        const newTimer = await this.timeEntriesRepo.create({
            userId,
            projectId: dto.projectId,
            taskId: dto.taskId,
            description: dto.description
        });

        this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
            action: 'timer_started',
            entity: 'TIME_ENTRY',
            entityId: newTimer.id,
            userId: userId,
            details: { projectId: dto.projectId, taskId: dto.taskId }
        });

        return newTimer;
    }
}
