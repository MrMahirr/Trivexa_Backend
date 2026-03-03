import { Injectable, Logger } from '@nestjs/common';
import { TasksRepository } from '../../infrastructure/tasks.repository';
import { ProjectsRepository } from '../../../projects/infrastructure/projects.repository';
import { ProjectNotFoundException } from '../../../projects/domain/project.rules';
import { AssigneeNotMemberException } from '../../domain/task.rules';
import { CreateTaskDto } from '../../api/dto/create-task.dto';

@Injectable()
export class CreateTaskUseCase {
  private readonly logger = new Logger(CreateTaskUseCase.name);

  constructor(
    private readonly tasksRepo: TasksRepository,
    private readonly projectsRepo: ProjectsRepository,
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
    return task;
  }
}
