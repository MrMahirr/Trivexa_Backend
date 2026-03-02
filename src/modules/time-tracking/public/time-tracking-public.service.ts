import { Injectable } from '@nestjs/common';
import { TimeEntriesRepository } from '../infrastructure/time-entries.repository';
import { TimeEntryEntity } from '../domain/time-entry.entity';

@Injectable()
export class TimeTrackingPublicService {
  constructor(private readonly timeEntriesRepo: TimeEntriesRepository) {}

  async findById(id: string): Promise<TimeEntryEntity | null> {
    return this.timeEntriesRepo.findById(id);
  }

  async findByUserId(userId: string): Promise<{ data: TimeEntryEntity[]; total: number }> {
    return this.timeEntriesRepo.findAll({ userId });
  }
}
