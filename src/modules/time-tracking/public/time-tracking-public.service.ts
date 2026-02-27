import { Injectable } from '@nestjs/common';
import { TimeTrackingService } from '../application/time-tracking.service';

@Injectable()
export class TimeTrackingPublicService {
    constructor(private readonly timeTrackingService: TimeTrackingService) { }

    /**
     * Retrieves the current active timer for a user, if any.
     * Useful for other modules (like Dashboard) to show active work.
     */
    async getActiveTimer(userId: string) {
        return this.timeTrackingService.getActiveTimer(userId);
    }

    /**
     * Fetches time entries for a specific user.
     * Useful for generating reports or calculating payroll.
     */
    async getUserTimeEntries(userId: string, options?: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
        const query = {
            userId,
            ...options
        };
        // Fetch as the user themselves to enforce row-level safety
        return this.timeTrackingService.findAll(query, userId, 'USER');
    }
}
