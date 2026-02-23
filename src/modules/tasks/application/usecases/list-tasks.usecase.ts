import { Injectable } from '@nestjs/common';
import { TasksRepository } from '../../infrastructure/tasks.repository';
import { ProjectsRepository } from '../../../projects/infrastructure/projects.repository';
import { ProjectNotFoundException } from '../../../projects/domain/project.rules';

@Injectable()
export class ListTasksUseCase {
  constructor(
    private readonly tasksRepo: TasksRepository,
    private readonly projectsRepo: ProjectsRepository,
  ) {}

  async execute(
    projectId: string,
    filters: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new ProjectNotFoundException();

    const { data, total } = await this.tasksRepo.findByProject(
      projectId,
      filters,
    );
    const page = filters.page || 1;
    const limit = filters.limit || 50;

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
