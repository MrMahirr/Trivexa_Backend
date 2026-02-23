import { Injectable, Logger } from '@nestjs/common';
import { ProjectsRepository } from '../../infrastructure/projects.repository';
import {
  ProjectRules,
  ProjectNotFoundException,
} from '../../domain/project.rules';
import { ProjectEntity } from '../../domain/project.entity';

@Injectable()
export class UpdateProjectStatusUseCase {
  private readonly logger = new Logger(UpdateProjectStatusUseCase.name);

  constructor(private readonly projectsRepo: ProjectsRepository) {}

  async execute(id: string, status: string): Promise<ProjectEntity | null> {
    const project = await this.projectsRepo.findById(id);
    if (!project) throw new ProjectNotFoundException();

    ProjectRules.validateStatusTransition(project.status, status);

    const updated = await this.projectsRepo.updateStatus(id, status);
    this.logger.log(`Project ${id} status: ${project.status} → ${status}`);
    return updated;
  }
}
