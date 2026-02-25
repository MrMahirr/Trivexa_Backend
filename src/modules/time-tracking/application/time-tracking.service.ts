import { Injectable } from '@nestjs/common';
import { TimeEntriesRepository } from '../infrastructure/time-entries.repository';
import { StartTimerUseCase } from './usecases/start-timer.usecase';
import { StopTimerUseCase } from './usecases/stop-timer.usecase';
import { ListEntriesUseCase } from './usecases/list-entries.usecase';
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
  constructor(
    private readonly timeRepo: TimeEntriesRepository,
    private readonly startTimerUseCase: StartTimerUseCase,
    private readonly stopTimerUseCase: StopTimerUseCase,
    private readonly listEntriesUseCase: ListEntriesUseCase,
  ) { }

  async startTimer(userId: string, dto: StartTimeEntryDto) {
    return this.startTimerUseCase.execute(userId, dto.projectId, dto.taskId, dto.description);
  }

  async stopTimer(userId: string) {
    return this.stopTimerUseCase.execute(userId);
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

    return this.listEntriesUseCase.execute({
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
