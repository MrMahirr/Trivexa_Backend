import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../shared/errors/not-found.error';

import { TimeEntryRepository } from '../infrastructure/repositories/time-entry.repository';
import { StartTimerUseCase } from './usecases/start-timer.usecase';
import { StopTimerUseCase } from './usecases/stop-timer.usecase';
import { CancelEntryUseCase } from './usecases/cancel-entry.usecase';
import { ListTimeEntriesQuery } from './queries/list-time-entries.query';
import { StartTimerDto } from '../api/dto/start-timer.dto';
import { StopTimerDto } from '../api/dto/stop-timer.dto';
import { CreateTimeEntryDto } from '../api/dto/create-time-entry.dto';
import {
  TimeEntryAlreadyApprovedException,
  TimeEntryNotFoundException } from '../domain/time-tracking.errors';

@Injectable()
export class TimeTrackingService {
  constructor(
    private readonly timeRepo: TimeEntryRepository,
    private readonly startTimerUseCase: StartTimerUseCase,
    private readonly stopTimerUseCase: StopTimerUseCase,
    private readonly cancelEntryUseCase: CancelEntryUseCase,
    private readonly listTimeEntriesQuery: ListTimeEntriesQuery,
  ) {}

  async startTimer(userId: string, dto: StartTimerDto) {
    return this.startTimerUseCase.execute(userId, dto);
  }

  async stopTimer(userId: string, dto: StopTimerDto) {
    return this.stopTimerUseCase.execute(userId, dto);
  }

  async cancelEntry(id: string, userId: string, isAdmin: boolean = false) {
    return this.cancelEntryUseCase.execute(id, userId, isAdmin);
  }

  async deleteEntry(id: string, userId: string, isAdmin: boolean = false) {
    return this.cancelEntryUseCase.execute(id, userId, isAdmin);
  }

  async getActiveTimer(userId: string) {
    return this.timeRepo.findActiveTimer(userId);
  }

  async createManualEntry(userId: string, dto: CreateTimeEntryDto) {
    return this.timeRepo.create({
      userId,
      projectId: dto.projectId,
      taskId: dto.taskId,
      startTime: dto.startTime ? new Date(dto.startTime) : new Date(),
      description: dto.description,
      isManual: true,
    });
  }

  async findAll(query: any, currentUserId: string, role: string) {
    return this.listTimeEntriesQuery.execute(query, currentUserId, role);
  }

  async approve(id: string) {
    const entry = await this.timeRepo.findById(id);
    if (!entry) throw new TimeEntryNotFoundException();
    if (entry.approved) throw new TimeEntryAlreadyApprovedException();

    // TODO: Implement approve logic securely through the new repo once rules are matched
    // return this.timeRepo.approve(id);
    throw new Error(
      'Approval logic is pending implementation on new repository format.',
    );
  }
}
