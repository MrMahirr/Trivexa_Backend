import { Injectable } from '@nestjs/common';

import { ProjectsRepository } from '../../infrastructure/projects.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { NotFoundError } from "../../../../shared/errors/not-found.error";

@Injectable()
export class AssignClientUseCase {
  constructor(
    private readonly projectsRepo: ProjectsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(projectId: string, clientId: string, assignedBy?: string) {
    const project = await this.projectsRepo.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const updated = await this.projectsRepo.update(projectId, { clientId });

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'client_assigned_to_project',
      entity: 'PROJECT',
      entityId: projectId,
      userId: assignedBy,
      details: { clientId },
    });

    return updated;
  }
}
