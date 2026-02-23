import { Injectable, Logger } from '@nestjs/common';
import { TasksRepository } from '../../infrastructure/tasks.repository';
import {
  TaskRules,
  TaskNotFoundException,
  BlockerNotCompletedException,
} from '../../domain/task.rules';

@Injectable()
export class UpdateTaskStatusUseCase {
  private readonly logger = new Logger(UpdateTaskStatusUseCase.name);

  constructor(private readonly tasksRepo: TasksRepository) {}

  async execute(id: string, status: string) {
    const task = await this.tasksRepo.findById(id);
    if (!task) throw new TaskNotFoundException();

    // Validate status transition
    TaskRules.validateStatusTransition(task.status, status);

    // If marking as DONE, check blockers are all completed
    if (status === 'DONE') {
      const blockers = await this.tasksRepo.findBlockers(id);
      const unfinished = blockers.filter((b) => b.status !== 'DONE');
      if (unfinished.length > 0) {
        throw new BlockerNotCompletedException();
      }
    }

    const updated = await this.tasksRepo.updateStatus(id, status);
    this.logger.log(`Task ${id} status: ${task.status} → ${status}`);
    return updated;
  }
}
