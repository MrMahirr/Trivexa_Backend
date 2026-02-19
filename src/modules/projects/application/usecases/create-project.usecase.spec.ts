import { Test, TestingModule } from '@nestjs/testing';
import { CreateProjectUseCase } from './create-project.usecase';
import { ProjectsRepository } from '../../infrastructure/projects.repository';
// import { CreateProjectDto } from '../../api/dto/create-project.dto';

// Mock DTO to avoid import issues
const mockDto: any = {
    name: 'New Project',
    description: 'Description',
    clientId: 'client-1',
    budget: 5000,
    startDate: new Date().toISOString(),
    deadline: new Date().toISOString(),
};

describe('CreateProjectUseCase', () => {
    let useCase: CreateProjectUseCase;
    let projectsRepo: Partial<jest.Mocked<ProjectsRepository>>;

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

    it('should create project successfully', async () => {
        const createdProject = {
            id: 'proj-1',
            ...mockDto,
            status: 'DRAFT',
            createdBy: 'user-1',
        };

        projectsRepo.create.mockResolvedValue(createdProject as any);

        const result = await useCase.execute(mockDto, 'user-1');

        expect(projectsRepo.create).toHaveBeenCalledWith({
            name: mockDto.name,
            description: mockDto.description,
            clientId: mockDto.clientId,
            budget: mockDto.budget,
            startDate: mockDto.startDate,
            deadline: mockDto.deadline,
            createdBy: 'user-1',
        });
        expect(result).toEqual(createdProject);
    });
});
