import { Injectable, Logger } from '@nestjs/common';
import { ProjectsRepository } from '../infrastructure/projects.repository';
import { CreateProjectUseCase } from './usecases/create-project.usecase';
import { UpdateProjectStatusUseCase } from './usecases/update-status.usecase';
import { CreateProjectDto } from '../api/dto/create-project.dto';
import { UpdateProjectDto } from '../api/dto/update-project.dto';
import { ProjectQueryDto } from '../api/dto/project-query.dto';
import { AddMemberDto } from '../api/dto/add-member.dto';
import {
    ProjectRules,
    ProjectNotFoundException,
    MemberAlreadyExistsException,
} from '../domain/project.rules';

@Injectable()
export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);

    constructor(
        private readonly projectsRepo: ProjectsRepository,
        private readonly createProjectUseCase: CreateProjectUseCase,
        private readonly updateStatusUseCase: UpdateProjectStatusUseCase,
    ) { }

    // ... findAll ...

    // ... findById ...

    async create(dto: CreateProjectDto, userId: string) {
        return this.createProjectUseCase.execute(dto, userId);
    }

    async update(id: string, dto: UpdateProjectDto) {
        const project = await this.projectsRepo.findById(id);
        if (!project) throw new ProjectNotFoundException();

        const updated = await this.projectsRepo.update(id, {
            name: dto.name,
            description: dto.description,
            budget: dto.budget,
            startDate: dto.startDate,
            deadline: dto.deadline,
        });

        this.logger.log(`Project updated: ${id}`);
        return updated;
    }

    async updateStatus(id: string, status: string) {
        return this.updateStatusUseCase.execute(id, status);
    }

    async addMember(projectId: string, dto: AddMemberDto) {
        const project = await this.projectsRepo.findById(projectId);
        if (!project) throw new ProjectNotFoundException();

        const exists = await this.projectsRepo.isMember(projectId, dto.userId);
        if (exists) throw new MemberAlreadyExistsException();

        const member = await this.projectsRepo.addMember(projectId, dto.userId, dto.role || 'MEMBER');
        this.logger.log(`Member ${dto.userId} added to project ${projectId}`);
        return member;
    }

    async removeMember(projectId: string, userId: string) {
        const project = await this.projectsRepo.findById(projectId);
        if (!project) throw new ProjectNotFoundException();

        await this.projectsRepo.removeMember(projectId, userId);
        this.logger.log(`Member ${userId} removed from project ${projectId}`);
    }

    async getMembers(projectId: string) {
        const project = await this.projectsRepo.findById(projectId);
        if (!project) throw new ProjectNotFoundException();
        return this.projectsRepo.getMembers(projectId);
    }
}
