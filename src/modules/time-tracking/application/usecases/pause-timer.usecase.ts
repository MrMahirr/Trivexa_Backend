import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TimeEntryRepository } from '../../infrastructure/repositories/time-entry.repository';

/**
 * Pause Timer Use Case
 *
 * Pauses an active timer by recording a pause start time.
 * The timer can be resumed later from this pause point.
 */
@Injectable()
export class PauseTimerUseCase {
  constructor(private readonly timeRepo: TimeEntryRepository) {}

  async execute(userId: string, entryId?: string) {
    // Find active timer
    const activeTimer = entryId
      ? await this.timeRepo.findById(entryId)
      : await this.timeRepo.findActiveTimer(userId);

    if (!activeTimer) {
      throw new NotFoundException('No active timer found');
    }

    // Check if timer belongs to user
    if (activeTimer.userId !== userId) {
      throw new BadRequestException('Timer does not belong to user');
    }

    // Check if already paused
    if (activeTimer.pausedAt) {
      throw new BadRequestException('Timer is already paused');
    }

    // Check if timer is stopped
    if (activeTimer.endTime) {
      throw new BadRequestException('Cannot pause a stopped timer');
    }

    // Pause the timer
    const pausedAt = new Date();
    const updated = await this.timeRepo.update(activeTimer.id, {
      pausedAt,
      updatedAt: pausedAt,
    });

    return {
      ...updated,
      status: 'paused',
      message: 'Timer paused successfully',
    };
  }
}
