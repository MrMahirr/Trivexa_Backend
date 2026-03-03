import { Injectable } from '@nestjs/common';
import { TasksRepository } from '../../infrastructure/tasks.repository';
import { TaskNotFoundException } from '../../domain/task.rules';

@Injectable()
export class GetTaskUseCase {
  constructor(private readonly tasksRepo: TasksRepository) {}

  async execute(id: string) {
    const task = await this.tasksRepo.findById(id);
    if (!task) throw new TaskNotFoundException();

    const blockers = await this.tasksRepo.findBlockers(id);
    return { ...task, blockers };
  }
}
