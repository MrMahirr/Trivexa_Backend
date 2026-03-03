import { Injectable } from '@nestjs/common';
import { TimeEntriesRepository } from '../../infrastructure/time-entries.repository';

interface ListEntriesFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  userId?: string;
}

@Injectable()
export class ListEntriesUseCase {
  constructor(private readonly timeEntriesRepo: TimeEntriesRepository) {}

  async execute(filters: ListEntriesFilters) {
    const { data, total } = await this.timeEntriesRepo.findAll(filters);

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
