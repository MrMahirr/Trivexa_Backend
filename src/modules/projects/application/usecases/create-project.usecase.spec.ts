import { Test, TestingModule } from '@nestjs/testing';
import { CreateProjectUseCase } from './create-project.usecase';
import { ProjectsRepository } from '../../infrastructure/projects.repository';
import { CreateProjectDto } from '../../api/dto/create-project.dto';
import { ProjectEntity } from '../../domain/project.entity';

describe('CreateProjectUseCase', () => {
    let useCase: CreateProjectUseCase;
    let projectsRepo: Partial<ProjectsRepository>;

    beforeEach(async () => {
        projectsRepo = {
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateProjectUseCase,
                { provide: ProjectsRepository, useValue: projectsRepo },
            ],
        }).compile();

        useCase = module.get<CreateProjectUseCase>(CreateProjectUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const userId = 'user-uuid';
        const dto: CreateProjectDto = {
            name: 'New Project',
            clientId: 'client-uuid',
            description: 'Description',
            budget: 5000,
            startDate: '2023-01-01',
            deadline: '2023-12-31',
        };

        const createdProject: ProjectEntity = {
            id: 'project-uuid',
            clientId: dto.clientId,
            name: dto.name,
            description: dto.description || null,
            status: 'PLANNED',
            budget: dto.budget || 0,
            startDate: dto.startDate || null,
            deadline: dto.deadline || null,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should successfully create a project', async () => {
            (projectsRepo.create as jest.Mock).mockResolvedValue(createdProject);

            const result = await useCase.execute(dto, userId);

            expect(projectsRepo.create).toHaveBeenCalledWith({
                name: dto.name,
                description: dto.description,
                clientId: dto.clientId,
                budget: dto.budget,
                startDate: dto.startDate,
                deadline: dto.deadline,
                createdBy: userId,
            });
            expect(result).toEqual(createdProject);
        });
    });
});
