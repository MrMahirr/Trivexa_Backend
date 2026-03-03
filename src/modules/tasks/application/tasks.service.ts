import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from '../api/dto/create-task.dto';
import { UpdateTaskDto } from '../api/dto/update-task.dto';
import { CreateTaskUseCase } from './usecases/create-task.usecase';
import { UpdateTaskUseCase } from './usecases/update-task.usecase';
import { GetTaskUseCase } from './usecases/get-task.usecase';
import { ListTasksUseCase } from './usecases/list-tasks.usecase';
import { UpdateTaskStatusUseCase } from './usecases/update-task-status.usecase';

@Injectable()
export class TasksService {
  constructor(
    private readonly createUseCase: CreateTaskUseCase,
    private readonly updateUseCase: UpdateTaskUseCase,
    private readonly getUseCase: GetTaskUseCase,
    private readonly listUseCase: ListTasksUseCase,
    private readonly updateStatusUseCase: UpdateTaskStatusUseCase,
  ) {}

  async findByProject(
    projectId: string,
    filters: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    return this.listUseCase.execute(projectId, filters);
  }

  async findById(id: string) {
    return this.getUseCase.execute(id);
  }

  async create(projectId: string, dto: CreateTaskDto, userId: string) {
    return this.createUseCase.execute(projectId, dto, userId);
  }

  async update(id: string, dto: UpdateTaskDto) {
    return this.updateUseCase.execute(id, dto);
  }

  async updateStatus(id: string, status: string) {
    return this.updateStatusUseCase.execute(id, status);
  }
}
