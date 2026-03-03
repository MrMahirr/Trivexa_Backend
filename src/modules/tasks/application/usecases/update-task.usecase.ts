import { Injectable, Logger } from '@nestjs/common';
import { TasksRepository } from '../../infrastructure/tasks.repository';
import { ProjectsRepository } from '../../../projects/infrastructure/projects.repository';
import {
  TaskNotFoundException,
  AssigneeNotMemberException,
} from '../../domain/task.rules';
import { UpdateTaskDto } from '../../api/dto/update-task.dto';

@Injectable()
export class UpdateTaskUseCase {
  private readonly logger = new Logger(UpdateTaskUseCase.name);

  constructor(
    private readonly tasksRepo: TasksRepository,
    private readonly projectsRepo: ProjectsRepository,
  ) {}

  async execute(id: string, dto: UpdateTaskDto) {
    const task = await this.tasksRepo.findById(id);
    if (!task) throw new TaskNotFoundException();

    // If assignee is being changed, check they are a project member
    if (dto.assigneeId) {
      const isMember = await this.projectsRepo.isMember(
        task.projectId,
        dto.assigneeId,
      );
      if (!isMember) throw new AssigneeNotMemberException();
    }

    const updated = await this.tasksRepo.update(id, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      assigneeId: dto.assigneeId,
      dueDate: dto.dueDate,
    });

    this.logger.log(`Task updated: ${id}`);
    return updated;
  }
}
