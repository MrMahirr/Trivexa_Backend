import { Injectable, Logger } from '@nestjs/common';
import { ProjectsRepository } from '../../infrastructure/projects.repository';
import { CreateProjectDto } from '../../api/dto/create-project.dto';
import { ProjectEntity } from '../../domain/project.entity';

@Injectable()
export class CreateProjectUseCase {
    private readonly logger = new Logger(CreateProjectUseCase.name);

    constructor(private readonly projectsRepo: ProjectsRepository) { }

    async execute(dto: CreateProjectDto, userId: string): Promise<ProjectEntity> {
        const project = await this.projectsRepo.create({
            name: dto.name,
            description: dto.description,
            clientId: dto.clientId,
            budget: dto.budget,
            startDate: dto.startDate,
            deadline: dto.deadline,
            createdBy: userId,
        });

        this.logger.log(`Project created: ${project.name} by ${userId}`);
        return project;
    }
}
