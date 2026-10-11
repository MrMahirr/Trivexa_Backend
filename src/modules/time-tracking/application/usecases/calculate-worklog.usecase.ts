import { Injectable } from '@nestjs/common';
import { TimeEntryRepository } from '../../infrastructure/repositories/time-entry.repository';

export interface WorklogSummary {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalMinutes: number;
  totalHours: number;
  entries: Array<{
    date: string;
    minutes: number;
    hours: number;
    entryCount: number;
  }>;
  byProject?: Array<{
    projectId: string;
    projectName?: string;
    minutes: number;
    hours: number;
    percentage: number;
  }>;
}

/**
 * Calculate Worklog Use Case
 *
 * Calculates daily, weekly, or monthly worklog summaries.
 * Handles pause time, overlap validation, and provides detailed breakdowns.
 */
@Injectable()
export class CalculateWorklogUseCase {
  constructor(private readonly timeRepo: TimeEntryRepository) {}

  /**
   * Calculate daily worklog summary
   */
  async calculateDaily(userId: string, date: Date): Promise<WorklogSummary> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.calculateWorklog(userId, startDate, endDate, 'daily');
  }

  /**
   * Calculate weekly worklog summary
   */
  async calculateWeekly(userId: string, weekStart: Date): Promise<WorklogSummary> {
    const startDate = new Date(weekStart);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return this.calculateWorklog(userId, startDate, endDate, 'weekly');
  }

  /**
   * Calculate monthly worklog summary
   */
  async calculateMonthly(userId: string, year: number, month: number): Promise<WorklogSummary> {
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    return this.calculateWorklog(userId, startDate, endDate, 'monthly');
  }

  /**
   * Main worklog calculation logic
   */
  private async calculateWorklog(
    userId: string,
    startDate: Date,
    endDate: Date,
    period: 'daily' | 'weekly' | 'monthly',
  ): Promise<WorklogSummary> {
    // Fetch all time entries for the period
    const entries = await this.timeRepo.findByUserAndDateRange(
      userId,
      startDate,
      endDate,
    );

    // Filter only completed entries
    const completedEntries = entries.filter((e) => e.endTime);

    // Calculate total minutes
    let totalMinutes = 0;
    const dailyBreakdown = new Map<string, { minutes: number; count: number }>();
    const projectBreakdown = new Map<string, { minutes: number; name?: string }>();

    for (const entry of completedEntries) {
      // Calculate duration in minutes
      const durationMs = entry.endTime.getTime() - entry.startTime.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);

      // Subtract pause time
      const pauseMinutes = entry.totalPauseMinutes || 0;
      const effectiveMinutes = Math.max(0, durationMinutes - pauseMinutes);

      totalMinutes += effectiveMinutes;

      // Daily breakdown
      const dateKey = entry.startTime.toISOString().split('T')[0];
      const existing = dailyBreakdown.get(dateKey) || { minutes: 0, count: 0 };
      dailyBreakdown.set(dateKey, {
        minutes: existing.minutes + effectiveMinutes,
        count: existing.count + 1,
      });

      // Project breakdown
      if (entry.projectId) {
        const projectExisting = projectBreakdown.get(entry.projectId) || {
          minutes: 0,
          name: entry.projectName, // Project name from joined query
        };
        projectBreakdown.set(entry.projectId, {
          minutes: projectExisting.minutes + effectiveMinutes,
          name: projectExisting.name || entry.projectName, // Use existing or current
        });
      }
    }

    // Format daily breakdown
    const entriesArray = Array.from(dailyBreakdown.entries()).map(
      ([date, data]) => ({
        date,
        minutes: data.minutes,
        hours: Math.round((data.minutes / 60) * 100) / 100,
        entryCount: data.count,
      }),
    );

    // Sort by date
    entriesArray.sort((a, b) => a.date.localeCompare(b.date));

    // Format project breakdown
    const byProject = Array.from(projectBreakdown.entries()).map(
      ([projectId, data]) => ({
        projectId,
        projectName: data.name,
        minutes: data.minutes,
        hours: Math.round((data.minutes / 60) * 100) / 100,
        percentage: Math.round((data.minutes / totalMinutes) * 100 * 100) / 100,
      }),
    );

    // Sort by minutes descending
    byProject.sort((a, b) => b.minutes - a.minutes);

    return {
      period,
      startDate,
      endDate,
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      entries: entriesArray,
      byProject: byProject.length > 0 ? byProject : undefined,
    };
  }

  /**
   * Validate overlap between time entries
   * Returns true if there's an overlap
   */
  async validateOverlap(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeEntryId?: string,
  ): Promise<{ hasOverlap: boolean; overlappingEntries?: any[] }> {
    const entries = await this.timeRepo.findByUserAndDateRange(
      userId,
      new Date(startTime.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      new Date(endTime.getTime() + 24 * 60 * 60 * 1000), // 1 day after
    );

    const overlapping = entries.filter((entry) => {
      // Skip the entry being updated
      if (excludeEntryId && entry.id === excludeEntryId) {
        return false;
      }

      // Skip entries without end time
      if (!entry.endTime) {
        return false;
      }

      // Check for overlap
      const entryStart = entry.startTime.getTime();
      const entryEnd = entry.endTime.getTime();
      const checkStart = startTime.getTime();
      const checkEnd = endTime.getTime();

      return (
        (checkStart >= entryStart && checkStart < entryEnd) ||
        (checkEnd > entryStart && checkEnd <= entryEnd) ||
        (checkStart <= entryStart && checkEnd >= entryEnd)
      );
    });

    return {
      hasOverlap: overlapping.length > 0,
      overlappingEntries: overlapping.length > 0 ? overlapping : undefined,
    };
  }
}
