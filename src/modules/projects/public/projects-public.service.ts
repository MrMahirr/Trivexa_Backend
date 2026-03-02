import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from '../infrastructure/projects.repository';
import { Project, ProjectEntity } from '../domain/project.entity';

/**
 * ProjectsPublicService — Diğer modüllere açılan proje API'si
 */
@Injectable()
export class ProjectsPublicService {
  constructor(private readonly projectsRepo: ProjectsRepository) {}

  async findById(id: string): Promise<ProjectEntity | null> {
    return this.projectsRepo.findById(id);
  }

  async exists(id: string): Promise<boolean> {
    const project = await this.projectsRepo.findById(id);
    return !!project;
  }
}
