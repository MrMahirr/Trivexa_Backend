import { Injectable, Logger } from '@nestjs/common';
import { TasksRepository } from '../../infrastructure/tasks.repository';
import { ProjectsRepository } from '../../../projects/infrastructure/projects.repository';
import { ProjectNotFoundException } from '../../../projects/domain/project.rules';
import { AssigneeNotMemberException } from '../../domain/task.rules';
import { CreateTaskDto } from '../../api/dto/create-task.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class CreateTaskUseCase {
  private readonly logger = new Logger(CreateTaskUseCase.name);

  constructor(
    private readonly tasksRepo: TasksRepository,
    private readonly projectsRepo: ProjectsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private toAssigneeIds(dto: CreateTaskDto): string[] {
    if (Array.isArray(dto.assigneeIds)) {
      return Array.from(new Set(dto.assigneeIds.filter(Boolean)));
    }
    if (dto.assigneeId) {
      return [dto.assigneeId];
    }
    return [];
  }

  async execute(projectId: string, dto: CreateTaskDto, userId: string) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new ProjectNotFoundException();

    const assigneeIds = this.toAssigneeIds(dto);

    // If assignees provided, check all are project members
    for (const assigneeId of assigneeIds) {
      const isMember = await this.projectsRepo.isMember(projectId, assigneeId);
      if (!isMember) {
        throw new AssigneeNotMemberException();
      }
    }

    const task = await this.tasksRepo.create({
      projectId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      assigneeId: assigneeIds[0],
      assigneeIds,
      dueDate: dto.dueDate,
      createdBy: userId,
    });

    this.logger.log(`Task created: ${task.title} in project ${projectId}`);

    this.eventEmitter.emit(SystemEvents.TASK_CREATED, {
      taskId: task.id,
      title: task.title,
      projectId: task.projectId,
      createdBy: task.createdBy,
      assigneeId: task.assigneeId,
      assigneeIds: task.assigneeIds,
    });

    return task;
  }
}
