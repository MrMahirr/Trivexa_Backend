import { Injectable, Logger } from '@nestjs/common';
import { TasksRepository } from '../infrastructure/tasks.repository';
import { ProjectsRepository } from '../../projects/infrastructure/projects.repository';
import { CreateTaskDto } from '../api/dto/create-task.dto';
import { UpdateTaskDto } from '../api/dto/update-task.dto';
import {
    TaskRules,
    TaskNotFoundException,
    AssigneeNotMemberException,
    BlockerNotCompletedException,
} from '../domain/task.rules';
import { ProjectNotFoundException } from '../../projects/domain/project.rules';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private readonly tasksRepo: TasksRepository,
        private readonly projectsRepo: ProjectsRepository,
    ) { }

    async findByProject(
        projectId: string,
        filters: { status?: string; priority?: string; assigneeId?: string; page?: number; limit?: number },
    ) {
        const project = await this.projectsRepo.findById(projectId);
        if (!project) throw new ProjectNotFoundException();

        const { data, total } = await this.tasksRepo.findByProject(projectId, filters);
        const page = filters.page || 1;
        const limit = filters.limit || 50;

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: string) {
        const task = await this.tasksRepo.findById(id);
        if (!task) throw new TaskNotFoundException();

        const blockers = await this.tasksRepo.findBlockers(id);
        return { ...task, blockers };
    }

    async create(projectId: string, dto: CreateTaskDto, userId: string) {
        const project = await this.projectsRepo.findById(projectId);
        if (!project) throw new ProjectNotFoundException();

        // If assignee provided, check they are a project member
        if (dto.assigneeId) {
            const isMember = await this.projectsRepo.isMember(projectId, dto.assigneeId);
            if (!isMember) throw new AssigneeNotMemberException();
        }

        const task = await this.tasksRepo.create({
            projectId,
            title: dto.title,
            description: dto.description,
            priority: dto.priority,
            assigneeId: dto.assigneeId,
            dueDate: dto.dueDate,
            createdBy: userId,
        });

        this.logger.log(`Task created: ${task.title} in project ${projectId}`);
        return task;
    }

    async update(id: string, dto: UpdateTaskDto) {
        const task = await this.tasksRepo.findById(id);
        if (!task) throw new TaskNotFoundException();

        // If assignee is being changed, check they are a project member
        if (dto.assigneeId) {
            const isMember = await this.projectsRepo.isMember(task.projectId, dto.assigneeId);
            if (!isMember) throw new AssigneeNotMemberException();
        }

        const updated = await this.tasksRepo.update(id, {
            title: dto.title,
            description: dto.description,
            priority: dto.priority,
            assigneeId: dto.assigneeId,
            dueDate: dto.dueDate,
        });

        this.logger.log(`Task updated: ${id}`);
        return updated;
    }

    async updateStatus(id: string, status: string) {
        const task = await this.tasksRepo.findById(id);
        if (!task) throw new TaskNotFoundException();

        // Validate status transition
        TaskRules.validateStatusTransition(task.status, status);

        // If marking as DONE, check blockers are all completed
        if (status === 'DONE') {
            const blockers = await this.tasksRepo.findBlockers(id);
            const unfinished = blockers.filter(b => b.status !== 'DONE');
            if (unfinished.length > 0) {
                throw new BlockerNotCompletedException();
            }
        }

        const updated = await this.tasksRepo.updateStatus(id, status);
        this.logger.log(`Task ${id} status: ${task.status} → ${status}`);
        return updated;
    }
}
