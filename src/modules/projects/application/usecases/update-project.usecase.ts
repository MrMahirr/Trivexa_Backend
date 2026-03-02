import { Injectable, Logger } from '@nestjs/common';
import { ProjectsRepository } from '../../infrastructure/projects.repository';
import { ProjectNotFoundException } from '../../domain/project.rules';
import { UpdateProjectDto } from '../../api/dto/update-project.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class UpdateProjectUseCase {
  private readonly logger = new Logger(UpdateProjectUseCase.name);

  constructor(
    private readonly projectsRepo: ProjectsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.projectsRepo.findById(id);
    if (!project) {
      throw new ProjectNotFoundException();
    }

    // Budget negatif olamaz
    if (dto.budget !== undefined && dto.budget < 0) {
      throw new Error('Budget cannot be negative');
    }

    // Deadline, startDate'den önce olamaz
    if (dto.startDate && dto.deadline) {
      if (new Date(dto.deadline) < new Date(dto.startDate)) {
        throw new Error('Deadline cannot be before start date');
      }
    }

    const updated = await this.projectsRepo.update(id, {
      name: dto.name,
      description: dto.description,
      budget: dto.budget,
      startDate: dto.startDate,
      deadline: dto.deadline,
    });

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'project_updated',
      entity: 'PROJECT',
      entityId: id,
      userId,
      details: { updatedFields: Object.keys(dto).filter((k) => dto[k] !== undefined) },
    });

    this.logger.log(`Project ${id} updated by user ${userId}`);
    return updated;
  }
}
