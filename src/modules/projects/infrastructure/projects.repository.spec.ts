import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsRepository } from './projects.repository';
import { DatabasePool } from '../../../database/pool';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import { BaseQuery } from '../../../database/query/base-query';
import { ProjectEntity } from '../domain/project.entity';

describe('ProjectsRepository', () => {
  let repository: ProjectsRepository;
  let dbPool: Partial<DatabasePool>;
  let cacheService: Partial<CacheService>;
  let mockClient: any;

  beforeEach(async () => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    dbPool = {
      getPool: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(mockClient),
      }),
    };

    cacheService = {
      getOrSet: jest.fn().mockImplementation((key, fn) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsRepository,
        { provide: DatabasePool, useValue: dbPool },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    repository = module.get<ProjectsRepository>(ProjectsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should call BaseQuery.queryMany with correct SQL and parameters', async () => {
      const queryOneSpy = jest
        .spyOn(BaseQuery, 'queryOne')
        .mockResolvedValue({ count: '5' });
      const queryManySpy = jest
        .spyOn(BaseQuery, 'queryMany')
        .mockResolvedValue([
          { id: '1', name: 'P1', status: 'ACTIVE' },
          { id: '2', name: 'P2', status: 'DRAFT' },
        ]);

      const result = await repository.findAll({
        page: 1,
        limit: 10,
        status: 'ACTIVE',
      });

      expect(result.total).toBe(5);
      expect(result.data).toHaveLength(2);
      expect(queryOneSpy).toHaveBeenCalled();
      expect(queryManySpy).toHaveBeenCalled();

      // Verify mock client release
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should use cacheService', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ count: '0' });
      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);

      await repository.findAll({ page: 1, limit: 10 });

      expect(cacheService.getOrSet).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return project if found', async () => {
      const mockRow = {
        id: 'p1',
        name: 'Project 1',
        budget: '1000',
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

      const result = await repository.findById('p1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('p1');
      expect(BaseQuery.queryOne).toHaveBeenCalledWith(
        mockClient,
        expect.any(String),
        ['p1'],
      );
    });

    it('should return null if not found', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create project and add default member', async () => {
      const mockRow = {
        id: 'new-id',
        name: 'New Project',
        created_by: 'creator-id',
      };

      const queryOneSpy = jest
        .spyOn(BaseQuery, 'queryOne')
        .mockResolvedValue(mockRow);
      const executeSpy = jest.spyOn(BaseQuery, 'execute').mockResolvedValue(1);

      const result = await repository.create({
        name: 'New Project',
        clientId: 'client-id',
        createdBy: 'creator-id',
      });

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(queryOneSpy).toHaveBeenCalled(); // create project
      expect(executeSpy).toHaveBeenCalled(); // add member
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

      // Verify call args for addMember logic
      expect(executeSpy).toHaveBeenCalledWith(
        mockClient,
        expect.stringContaining('INSERT INTO project_members'),
        ['new-id', 'creator-id', 'PROJECT_LEAD'],
      );
    });

    it('should rollback on error', async () => {
      jest
        .spyOn(BaseQuery, 'queryOne')
        .mockRejectedValue(new Error('DB Error'));

      await expect(
        repository.create({
          name: 'Fail',
          clientId: 'c',
          createdBy: 'u',
        }),
      ).rejects.toThrow('DB Error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});
