import { Injectable } from '@nestjs/common';
import { TimeEntriesRepository } from '../infrastructure/time-entries.repository';
import { StartTimeEntryDto } from '../api/dto/start-time-entry.dto';
import { CreateTimeEntryDto } from '../api/dto/create-time-entry.dto';
import { TimeEntryQueryDto } from '../api/dto/time-entry-query.dto';
import {
  ActiveTimerExistsException,
  NoActiveTimerException,
  TimeEntryNotFoundException,
  TimeEntryAlreadyApprovedException,
} from '../domain/time-tracking.errors';

@Injectable()
export class TimeTrackingService {
  constructor(private readonly timeRepo: TimeEntriesRepository) {}

  async startTimer(userId: string, dto: StartTimeEntryDto) {
    const active = await this.timeRepo.findActiveTimer(userId);
    if (active) throw new ActiveTimerExistsException();

    return this.timeRepo.start(
      userId,
      dto.projectId,
      dto.taskId,
      dto.description,
    );
  }

  async stopTimer(userId: string) {
    const active = await this.timeRepo.findActiveTimer(userId);
    if (!active) throw new NoActiveTimerException();

    return this.timeRepo.stop(active.id);
  }

  async getActiveTimer(userId: string) {
    return this.timeRepo.findActiveTimer(userId);
  }

  async createManualEntry(userId: string, dto: CreateTimeEntryDto) {
    // Simple manual creation, no overlap check implemented for now
    return this.timeRepo.createManual({
      userId,
      projectId: dto.projectId,
      taskId: dto.taskId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      description: dto.description,
    });
  }

  async findAll(query: TimeEntryQueryDto, currentUserId: string, role: string) {
    // If not admin/manager, force userId filter to current user
    const filterUserId =
      role === 'ADMIN' || role === 'MANAGER' ? query.userId : currentUserId;

    return this.timeRepo.findAll({
      ...query,
      userId: filterUserId,
    });
  }

  async approve(id: string) {
    const entry = await this.timeRepo.findById(id);
    if (!entry) throw new TimeEntryNotFoundException();
    if (entry.approved) throw new TimeEntryAlreadyApprovedException();

    return this.timeRepo.approve(id);
  }
}
