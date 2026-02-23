import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskUseCase } from './create-task.usecase';
import { TasksRepository } from '../../infrastructure/tasks.repository';
import { ProjectsRepository } from '../../../projects/infrastructure/projects.repository';
import { ProjectNotFoundException } from '../../../projects/domain/project.rules';
import { AssigneeNotMemberException } from '../../domain/task.rules';

// Mock DTO to avoid import issues
const mockDto: any = {
  title: 'Test Task',
  description: 'Desc',
  priority: 'MEDIUM',
  assigneeId: 'user-2',
  dueDate: new Date().toISOString(),
};

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let tasksRepo: Partial<jest.Mocked<TasksRepository>>;
  let projectsRepo: Partial<jest.Mocked<ProjectsRepository>>;

  beforeEach(async () => {
    tasksRepo = {
      create: jest.fn(),
    };
    projectsRepo = {
      findById: jest.fn(),
      isMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
        { provide: TasksRepository, useValue: tasksRepo },
        { provide: ProjectsRepository, useValue: projectsRepo },
      ],
    }).compile();

    useCase = module.get<CreateTaskUseCase>(CreateTaskUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw ProjectNotFoundException if project does not exist', async () => {
    projectsRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('proj-1', mockDto, 'user-1')).rejects.toThrow(
      ProjectNotFoundException,
    );
  });

  it('should throw AssigneeNotMemberException if assignee is not a member', async () => {
    projectsRepo.findById.mockResolvedValue({ id: 'proj-1' } as any);
    projectsRepo.isMember.mockResolvedValue(false);
    await expect(useCase.execute('proj-1', mockDto, 'user-1')).rejects.toThrow(
      AssigneeNotMemberException,
    );
  });

  it('should create task successfully', async () => {
    const project = { id: 'proj-1', name: 'Project 1' };
    projectsRepo.findById.mockResolvedValue(project as any);
    projectsRepo.isMember.mockResolvedValue(true);

    const createdTask = {
      id: 'task-1',
      projectId: 'proj-1',
      ...mockDto,
      status: 'TODO',
      createdBy: 'user-1',
    };

    tasksRepo.create.mockResolvedValue(createdTask);

    const result = await useCase.execute('proj-1', mockDto, 'user-1');

    expect(projectsRepo.findById).toHaveBeenCalledWith('proj-1');
    expect(projectsRepo.isMember).toHaveBeenCalledWith(
      'proj-1',
      mockDto.assigneeId,
    );
    expect(tasksRepo.create).toHaveBeenCalledWith({
      projectId: 'proj-1',
      title: mockDto.title,
      description: mockDto.description,
      priority: mockDto.priority,
      assigneeId: mockDto.assigneeId,
      dueDate: mockDto.dueDate,
      createdBy: 'user-1',
    });
    expect(result).toEqual(createdTask);
  });
});
