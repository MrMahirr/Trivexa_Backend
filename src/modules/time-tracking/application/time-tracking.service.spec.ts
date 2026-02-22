import { Test, TestingModule } from '@nestjs/testing';
import { TimeTrackingService } from './time-tracking.service';
import { TimeEntriesRepository } from '../infrastructure/time-entries.repository';
import {
    ActiveTimerExistsException,
    NoActiveTimerException,
    TimeEntryNotFoundException,
    TimeEntryAlreadyApprovedException,
} from '../domain/time-tracking.errors';

describe('TimeTrackingService', () => {
    let service: TimeTrackingService;
    let timeRepo: Partial<jest.Mocked<TimeEntriesRepository>>;

    const mockEntry: any = {
        id: 'entry-1',
        userId: 'user-1',
        projectId: 'proj-1',
        taskId: 'task-1',
        startTime: new Date(),
        endTime: null,
        durationMinutes: null,
        description: 'Working on feature',
        isManual: false,
        approved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        timeRepo = {
            findActiveTimer: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            createManual: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            approve: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimeTrackingService,
                { provide: TimeEntriesRepository, useValue: timeRepo },
            ],
        }).compile();

        service = module.get<TimeTrackingService>(TimeTrackingService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('startTimer', () => {
        it('should start a new timer when no active timer exists', async () => {
            timeRepo.findActiveTimer.mockResolvedValue(null);
            timeRepo.start.mockResolvedValue(mockEntry);

            const dto: any = { projectId: 'proj-1', taskId: 'task-1', description: 'Working on feature' };
            const result = await service.startTimer('user-1', dto);

            expect(result).toEqual(mockEntry);
            expect(timeRepo.start).toHaveBeenCalledWith('user-1', 'proj-1', 'task-1', 'Working on feature');
        });

        it('should throw ActiveTimerExistsException when user already has an active timer', async () => {
            timeRepo.findActiveTimer.mockResolvedValue(mockEntry);

            await expect(service.startTimer('user-1', {} as any))
                .rejects.toThrow(ActiveTimerExistsException);

            expect(timeRepo.start).not.toHaveBeenCalled();
        });
    });

    describe('stopTimer', () => {
        it('should stop the active timer', async () => {
            const stoppedEntry = { ...mockEntry, endTime: new Date() };
            timeRepo.findActiveTimer.mockResolvedValue(mockEntry);
            timeRepo.stop.mockResolvedValue(stoppedEntry);

            const result = await service.stopTimer('user-1');

            expect(result.endTime).toBeDefined();
            expect(timeRepo.stop).toHaveBeenCalledWith('entry-1');
        });

        it('should throw NoActiveTimerException when no active timer', async () => {
            timeRepo.findActiveTimer.mockResolvedValue(null);

            await expect(service.stopTimer('user-1'))
                .rejects.toThrow(NoActiveTimerException);

            expect(timeRepo.stop).not.toHaveBeenCalled();
        });
    });

    describe('getActiveTimer', () => {
        it('should return active timer or null', async () => {
            timeRepo.findActiveTimer.mockResolvedValue(mockEntry);

            const result = await service.getActiveTimer('user-1');

            expect(result).toEqual(mockEntry);
        });
    });

    describe('createManualEntry', () => {
        it('should create a manual time entry', async () => {
            const manualEntry = { ...mockEntry, isManual: true };
            timeRepo.createManual.mockResolvedValue(manualEntry);

            const dto: any = {
                projectId: 'proj-1',
                taskId: 'task-1',
                startTime: '2026-01-01T09:00:00Z',
                endTime: '2026-01-01T17:00:00Z',
                description: 'Full day work',
            };

            const result = await service.createManualEntry('user-1', dto);

            expect(result.isManual).toBe(true);
            expect(timeRepo.createManual).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'user-1',
                    startTime: '2026-01-01T09:00:00Z',
                    endTime: '2026-01-01T17:00:00Z',
                }),
            );
        });
    });

    describe('findAll', () => {
        it('should allow ADMIN to query any user', async () => {
            timeRepo.findAll.mockResolvedValue({ data: [], total: 0 });

            await service.findAll({ userId: 'other-user' } as any, 'current-user', 'ADMIN');

            expect(timeRepo.findAll).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 'other-user' }),
            );
        });

        it('should allow MANAGER to query any user', async () => {
            timeRepo.findAll.mockResolvedValue({ data: [], total: 0 });

            await service.findAll({ userId: 'other-user' } as any, 'current-user', 'MANAGER');

            expect(timeRepo.findAll).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 'other-user' }),
            );
        });

        it('should force current userId for non-admin users', async () => {
            timeRepo.findAll.mockResolvedValue({ data: [], total: 0 });

            await service.findAll({ userId: 'other-user' } as any, 'current-user', 'EMPLOYEE');

            expect(timeRepo.findAll).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 'current-user' }),
            );
        });
    });

    describe('approve', () => {
        it('should approve an unapproved entry', async () => {
            timeRepo.findById.mockResolvedValue({ ...mockEntry, approved: false });
            timeRepo.approve.mockResolvedValue({ ...mockEntry, approved: true });

            const result = await service.approve('entry-1');

            expect(result.approved).toBe(true);
            expect(timeRepo.approve).toHaveBeenCalledWith('entry-1');
        });

        it('should throw TimeEntryNotFoundException if entry not found', async () => {
            timeRepo.findById.mockResolvedValue(null);

            await expect(service.approve('non-existent'))
                .rejects.toThrow(TimeEntryNotFoundException);
        });

        it('should throw TimeEntryAlreadyApprovedException if already approved', async () => {
            timeRepo.findById.mockResolvedValue({ ...mockEntry, approved: true });

            await expect(service.approve('entry-1'))
                .rejects.toThrow(TimeEntryAlreadyApprovedException);

            expect(timeRepo.approve).not.toHaveBeenCalled();
        });
    });
});
