import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from '../../infrastructure/projects.repository';
import { ProjectNotFoundException } from '../../domain/project.rules';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class UpdateGithubUrlUseCase {
  constructor(
    private readonly projectsRepo: ProjectsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(projectId: string, githubUrl: string, userId: string) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }

    // GitHub URL format doğrulama
    if (!githubUrl.startsWith('https://github.com/')) {
      throw new Error(
        'Invalid GitHub URL. Must start with https://github.com/',
      );
    }

    const updated = await this.projectsRepo.update(projectId, {
      // githubUrl alanı — projects tablosunda github_url sütunu varsa
    });

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'github_url_updated',
      entity: 'PROJECT',
      entityId: projectId,
      userId,
      details: { githubUrl },
    });

    return updated;
  }
}
