import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TimeEntryRepository } from '../../infrastructure/repositories/time-entry.repository';
import { TimeEntryEntity } from '../../domain/time-entry.entity';

@Injectable()
export class CancelEntryUseCase {
  constructor(private readonly timeEntryRepo: TimeEntryRepository) {}

  async execute(
    entryId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<TimeEntryEntity> {
    const entry = await this.timeEntryRepo.findById(entryId);

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    // Only allow the owner or an admin/manager/ceo to delete the timer entry
    if (entry.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this time entry',
      );
    }

    // Hard delete from history
    await this.timeEntryRepo.delete(entryId);

    return entry;
  }
}
