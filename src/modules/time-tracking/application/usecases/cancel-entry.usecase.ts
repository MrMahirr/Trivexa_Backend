import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TimeEntryRepository } from '../../infrastructure/repositories/time-entry.repository';

@Injectable()
export class CancelEntryUseCase {
    constructor(private readonly timeEntryRepo: TimeEntryRepository) { }

    async execute(entryId: string, userId: string, isAdmin: boolean = false): Promise<void> {
        const entry = await this.timeEntryRepo.findById(entryId);

        if (!entry) {
            throw new NotFoundException('Time entry not found');
        }

        // Only allow the owner or an admin to cancel/delete the timer
        if (entry.userId !== userId && !isAdmin) {
            throw new ForbiddenException('You do not have permission to cancel this time entry');
        }

        // Since this is a hard cancel, we delete the entry from the database
        await this.timeEntryRepo.delete(entryId);
    }
}
