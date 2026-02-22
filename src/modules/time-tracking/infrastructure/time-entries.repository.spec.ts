import { Test, TestingModule } from '@nestjs/testing';
import { TimeEntriesRepository } from './time-entries.repository';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';

describe('TimeEntriesRepository', () => {
    let repository: TimeEntriesRepository;
    let dbPool: Partial<DatabasePool>;
    let mockClient: any;

    const mockRow: any = {
        id: 'entry-1',
        user_id: 'user-1',
        project_id: 'proj-1',
        task_id: 'task-1',
        start_time: new Date('2026-01-01T09:00:00Z'),
        end_time: null,
        duration_minutes: null,
        description: 'Working',
        is_manual: false,
        approved: false,
        created_at: new Date(),
        updated_at: new Date(),
    };

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

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimeEntriesRepository,
                { provide: DatabasePool, useValue: dbPool },
            ],
        }).compile();

        repository = module.get<TimeEntriesRepository>(TimeEntriesRepository);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findActiveTimer', () => {
        it('should return active timer for user', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

            const result = await repository.findActiveTimer('user-1');

            expect(result).toBeDefined();
            expect(result?.userId).toBe('user-1');
            expect(result?.endTime).toBeNull();
            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('end_time IS NULL'),
                ['user-1'],
            );
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should return null if no active timer', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

            const result = await repository.findActiveTimer('user-1');

            expect(result).toBeNull();
        });
    });

    describe('start', () => {
        it('should insert a new time entry', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

            const result = await repository.start('user-1', 'proj-1', 'task-1', 'Working');

            expect(result.userId).toBe('user-1');
            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('INSERT INTO time_entries'),
                ['user-1', 'proj-1', 'task-1', 'Working'],
            );
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should insert with null optional fields', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ ...mockRow, project_id: null, task_id: null });

            await repository.start('user-1');

            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('INSERT'),
                ['user-1', null, null, null],
            );
        });
    });

    describe('stop', () => {
        it('should update end_time and return entry', async () => {
            const stoppedRow = { ...mockRow, end_time: new Date() };
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(stoppedRow);

            const result = await repository.stop('entry-1');

            expect(result?.endTime).toBeDefined();
            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('end_time = NOW()'),
                ['entry-1'],
            );
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should return null if entry not found', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

            const result = await repository.stop('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('createManual', () => {
        it('should insert manual entry with is_manual=true', async () => {
            const manualRow = { ...mockRow, is_manual: true };
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(manualRow);

            const result = await repository.createManual({
                userId: 'user-1',
                projectId: 'proj-1',
                startTime: '2026-01-01T09:00:00Z',
                endTime: '2026-01-01T17:00:00Z',
                description: 'Full day',
            });

            expect(result.isManual).toBe(true);
            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('is_manual'),
                expect.arrayContaining(['user-1', 'proj-1']),
            );
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return entry by id', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

            const result = await repository.findById('entry-1');

            expect(result?.id).toBe('entry-1');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should return null if not found', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

            const result = await repository.findById('x');

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return paginated results', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ count: '5' });
            jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([mockRow]);

            const result = await repository.findAll({ page: 1, limit: 10 });

            expect(result.total).toBe(5);
            expect(result.data).toHaveLength(1);
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should apply userId filter', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ count: '0' });
            jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);

            await repository.findAll({ userId: 'user-1' });

            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('user_id'),
                expect.arrayContaining(['user-1']),
            );
        });

        it('should apply projectId filter', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ count: '0' });
            jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);

            await repository.findAll({ projectId: 'proj-1' });

            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('project_id'),
                expect.arrayContaining(['proj-1']),
            );
        });
    });

    describe('approve', () => {
        it('should set approved to true', async () => {
            const approvedRow = { ...mockRow, approved: true };
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(approvedRow);

            const result = await repository.approve('entry-1');

            expect(result?.approved).toBe(true);
            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('approved = true'),
                ['entry-1'],
            );
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should return null if entry not found', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

            const result = await repository.approve('non-existent');

            expect(result).toBeNull();
        });
    });
});
