import { Injectable, Logger } from '@nestjs/common';
import { ProjectsRepository } from '../infrastructure/projects.repository';
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

    constructor(private readonly projectsRepo: ProjectsRepository) { }

    async findAll(query: ProjectQueryDto, userId: string, role: string) {
        const { data, total } = await this.projectsRepo.findAll(
            {
                page: query.page || 1,
                limit: query.limit || 20,
                status: query.status,
                clientId: query.clientId,
                search: query.search,
            },
            userId,
            role,
        );

        return {
            data,
            meta: {
                total,
                page: query.page || 1,
                limit: query.limit || 20,
                totalPages: Math.ceil(total / (query.limit || 20)),
            },
        };
    }

    async findById(id: string) {
        const project = await this.projectsRepo.findById(id);
        if (!project) throw new ProjectNotFoundException();

        const members = await this.projectsRepo.getMembers(id);
        const metrics = await this.projectsRepo.getTaskMetrics(id);

        return { ...project, members, metrics };
    }

    async create(dto: CreateProjectDto, userId: string) {
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
        const project = await this.projectsRepo.findById(id);
        if (!project) throw new ProjectNotFoundException();

        ProjectRules.validateStatusTransition(project.status, status);

        const updated = await this.projectsRepo.updateStatus(id, status);
        this.logger.log(`Project ${id} status: ${project.status} → ${status}`);
        return updated;
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
