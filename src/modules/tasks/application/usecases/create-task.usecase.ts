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

  async execute(projectId: string, dto: CreateTaskDto, userId: string) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new ProjectNotFoundException();

    // If assignee provided, check they are a project member
    if (dto.assigneeId) {
      const isMember = await this.projectsRepo.isMember(
        projectId,
        dto.assigneeId,
      );
      if (!isMember) throw new AssigneeNotMemberException();
    }

    const task = await this.tasksRepo.create({
      projectId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      assigneeId: dto.assigneeId,
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
    });

    return task;
  }
}
