import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TimeEntryRepository } from '../../infrastructure/repositories/time-entry.repository';

/**
 * Resume Timer Use Case
 *
 * Resumes a paused timer by calculating pause duration and
 * adjusting the total pause time.
 */
@Injectable()
export class ResumeTimerUseCase {
  constructor(private readonly timeRepo: TimeEntryRepository) {}

  async execute(userId: string, entryId?: string) {
    // Find paused timer
    const pausedTimer = entryId
      ? await this.timeRepo.findById(entryId)
      : await this.timeRepo.findActiveTimer(userId);

    if (!pausedTimer) {
      throw new NotFoundException('No timer found');
    }

    // Check if timer belongs to user
    if (pausedTimer.userId !== userId) {
      throw new BadRequestException('Timer does not belong to user');
    }

    // Check if timer is actually paused
    if (!pausedTimer.pausedAt) {
      throw new BadRequestException('Timer is not paused');
    }

    // Check if timer is stopped
    if (pausedTimer.endTime) {
      throw new BadRequestException('Cannot resume a stopped timer');
    }

    // Calculate pause duration
    const resumeTime = new Date();
    const pauseDurationMs = resumeTime.getTime() - pausedTimer.pausedAt.getTime();
    const pauseDurationMinutes = Math.floor(pauseDurationMs / 60000);

    // Update total pause time
    const totalPauseMinutes = (pausedTimer.totalPauseMinutes || 0) + pauseDurationMinutes;

    // Resume the timer
    const updated = await this.timeRepo.update(pausedTimer.id, {
      pausedAt: null,
      totalPauseMinutes,
      updatedAt: resumeTime,
    });

    return {
      ...updated,
      status: 'running',
      pauseDuration: {
        minutes: pauseDurationMinutes,
        totalPauseMinutes,
      },
      message: 'Timer resumed successfully',
    };
  }
}
