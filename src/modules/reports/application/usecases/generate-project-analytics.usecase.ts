import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from '../../../projects/infrastructure/projects.repository';
import { TasksRepository } from '../../../tasks/infrastructure/tasks.repository';
import { GenerateProjectAnalyticsDto } from '../../api/dto/generate-project-analytics.dto';
import { ProjectNotFoundException } from '../../../projects/domain/project.rules';

@Injectable()
export class GenerateProjectAnalyticsUseCase {
  constructor(
    private readonly projectsRepo: ProjectsRepository,
    private readonly tasksRepo: TasksRepository,
  ) {}

  async execute(dto: GenerateProjectAnalyticsDto) {
    if (dto.projectId) {
      const project = await this.projectsRepo.findById(dto.projectId);
      if (!project) throw new ProjectNotFoundException();

      const [taskStats, taskMetrics] = await Promise.all([
        this.tasksRepo.getStatistics(dto.projectId),
        this.projectsRepo.getTaskMetrics(dto.projectId),
      ]);

      return {
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          budget: project.budget,
          deadline: project.deadline,
        },
        tasks: {
          total: taskMetrics.total,
          completed: taskMetrics.completed,
          completionRate: taskMetrics.percentage,
          distribution: {
            byStatus: taskStats.byStatus,
            byPriority: taskStats.byPriority,
          },
        },
      };
    } else {
      // Global stats
      const taskStats = await this.tasksRepo.getStatistics();
      return {
        global: true,
        tasks: {
          distribution: {
            byStatus: taskStats.byStatus,
            byPriority: taskStats.byPriority,
          },
        },
      };
    }
  }
}
