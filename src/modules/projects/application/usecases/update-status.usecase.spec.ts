import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProjectStatusUseCase } from './update-status.usecase';
import { ProjectsRepository } from '../../infrastructure/projects.repository';
import { ProjectRules, ProjectNotFoundException } from '../../domain/project.rules';
import { HttpException } from '@nestjs/common';
import { ProjectEntity } from '../../domain/project.entity';

describe('UpdateProjectStatusUseCase', () => {
    let useCase: UpdateProjectStatusUseCase;
    let projectsRepo: Partial<ProjectsRepository>;

    beforeEach(async () => {
        projectsRepo = {
            findById: jest.fn(),
            updateStatus: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateProjectStatusUseCase,
                { provide: ProjectsRepository, useValue: projectsRepo },
            ],
        }).compile();

        useCase = module.get<UpdateProjectStatusUseCase>(UpdateProjectStatusUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const projectId = 'project-uuid';
        const project: ProjectEntity = {
            id: projectId,
            clientId: 'client',
            name: 'Test Project',
            description: null,
            status: 'DRAFT',
            budget: 0,
            startDate: null,
            deadline: null,
            createdBy: 'creator',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should successfully update status for a valid transition', async () => {
            const newStatus = 'ACTIVE';
            const updatedProject = { ...project, status: newStatus };

            (projectsRepo.findById as jest.Mock).mockResolvedValue(project);
            (projectsRepo.updateStatus as jest.Mock).mockResolvedValue(updatedProject);

            const result = await useCase.execute(projectId, newStatus);

            expect(projectsRepo.findById).toHaveBeenCalledWith(projectId);
            expect(projectsRepo.updateStatus).toHaveBeenCalledWith(projectId, newStatus);
            expect(result).toEqual(updatedProject);
        });

        it('should throw ProjectNotFoundException if project does not exist', async () => {
            (projectsRepo.findById as jest.Mock).mockResolvedValue(null);

            await expect(useCase.execute(projectId, 'ACTIVE')).rejects.toThrow(ProjectNotFoundException);
        });

        it('should throw HttpException for invalid transition', async () => {
            // DRAFT -> COMPLETED is invalid
            const invalidStatus = 'COMPLETED';
            (projectsRepo.findById as jest.Mock).mockResolvedValue(project);

            await expect(useCase.execute(projectId, invalidStatus)).rejects.toThrow(HttpException);
            expect(projectsRepo.updateStatus).not.toHaveBeenCalled();
        });
    });
});
