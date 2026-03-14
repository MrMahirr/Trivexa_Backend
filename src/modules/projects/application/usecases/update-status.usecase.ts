import { Injectable, Logger } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error';

import { ProjectsRepository } from '../../infrastructure/projects.repository';
import { ProjectRules } from '../../domain/project.rules';
import { ProjectEntity } from '../../domain/project.entity';

@Injectable()
export class UpdateProjectStatusUseCase {
  private readonly logger = new Logger(UpdateProjectStatusUseCase.name);

  constructor(private readonly projectsRepo: ProjectsRepository) {}

  async execute(id: string, status: string): Promise<ProjectEntity | null> {
    const project = await this.projectsRepo.findById(id);
    if (!project) throw new NotFoundError();

    ProjectRules.validateStatusTransition(project.status, status);

    const updated = await this.projectsRepo.updateStatus(id, status);
    this.logger.log(`Project ${id} status: ${project.status} → ${status}`);
    return updated;
  }
}
