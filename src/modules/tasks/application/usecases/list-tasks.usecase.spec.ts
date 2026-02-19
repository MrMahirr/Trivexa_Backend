import { Test, TestingModule } from '@nestjs/testing';
import { ListTasksUseCase } from './list-tasks.usecase';
import { TasksRepository } from '../../infrastructure/tasks.repository';
import { ProjectsRepository } from '../../../projects/infrastructure/projects.repository';
import { ProjectNotFoundException } from '../../../projects/domain/project.rules';

describe('ListTasksUseCase', () => {
    let useCase: ListTasksUseCase;
    let tasksRepo: Partial<jest.Mocked<TasksRepository>>;
    let projectsRepo: Partial<jest.Mocked<ProjectsRepository>>;

    beforeEach(async () => {
        tasksRepo = {
            findByProject: jest.fn(),
        };
        projectsRepo = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListTasksUseCase,
                { provide: TasksRepository, useValue: tasksRepo },
                { provide: ProjectsRepository, useValue: projectsRepo },
            ],
        }).compile();

        useCase = module.get<ListTasksUseCase>(ListTasksUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should throw ProjectNotFoundException if project does not exist', async () => {
        projectsRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute('proj-1', {})).rejects.toThrow(ProjectNotFoundException);
    });

    it('should return paginated tasks', async () => {
        const project = { id: 'proj-1', name: 'Project 1' };
        projectsRepo.findById.mockResolvedValue(project as any);

        const tasks = [{ id: 'task-1', title: 'Task 1' }];
        tasksRepo.findByProject.mockResolvedValue({
            data: tasks as any,
            total: 1,
        });

        const result = await useCase.execute('proj-1', { page: 1, limit: 10 });

        expect(projectsRepo.findById).toHaveBeenCalledWith('proj-1');
        expect(tasksRepo.findByProject).toHaveBeenCalledWith('proj-1', { page: 1, limit: 10 });
        expect(result).toEqual({
            data: tasks,
            meta: {
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
            },
        });
    });
});
