import { Injectable, Logger } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error';

import { TasksRepository } from '../../infrastructure/tasks.repository';
import { ProjectsRepository } from '../../../projects/infrastructure/projects.repository';
import {
  AssigneeNotMemberException,
  TaskNotFoundException } from '../../domain/task.rules';
import { UpdateTaskDto } from '../../api/dto/update-task.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class UpdateTaskUseCase {
  private readonly logger = new Logger(UpdateTaskUseCase.name);

  constructor(
    private readonly tasksRepo: TasksRepository,
    private readonly projectsRepo: ProjectsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private toAssigneeIds(dto: UpdateTaskDto): string[] | undefined {
    if (Array.isArray(dto.assigneeIds)) {
      return Array.from(new Set(dto.assigneeIds.filter(Boolean)));
    }
    if (dto.assigneeId !== undefined) {
      return dto.assigneeId ? [dto.assigneeId] : [];
    }
    return undefined;
  }

  async execute(id: string, dto: UpdateTaskDto) {
    const task = await this.tasksRepo.findById(id);
    if (!task) throw new TaskNotFoundException();

    const assigneeIds = this.toAssigneeIds(dto);

    // If assignees are being changed, check they are project members
    if (assigneeIds !== undefined) {
      for (const assigneeId of assigneeIds) {
        const isMember = await this.projectsRepo.isMember(
          task.projectId,
          assigneeId,
        );
        if (!isMember) {
          throw new AssigneeNotMemberException();
        }
      }
    }

    const updated = await this.tasksRepo.update(id, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      assigneeId: assigneeIds?.[0],
      assigneeIds,
      dueDate: dto.dueDate,
    });

    this.logger.log(`Task updated: ${id}`);

    this.eventEmitter.emit(SystemEvents.TASK_UPDATED, {
      taskId: updated.id,
      title: updated.title,
      projectId: updated.projectId,
      createdBy: updated.createdBy,
      assigneeId: updated.assigneeId,
      assigneeIds: updated.assigneeIds,
    });

    return updated;
  }
}
