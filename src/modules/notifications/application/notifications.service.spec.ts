import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from '../infrastructure/notifications.repository';
import { Notification } from '../domain/notification.entity';

describe('NotificationsService', () => {
    let service: NotificationsService;
    let notificationsRepo: Partial<jest.Mocked<NotificationsRepository>>;

    const mockNotification = new Notification({
        id: 'notif-1',
        userId: 'user-1',
        type: 'TASK_ASSIGNED',
        title: 'New Task',
        message: 'You have been assigned a new task.',
        isRead: false,
        metadata: { taskId: 'task-1' },
        createdAt: new Date(),
    });

    beforeEach(async () => {
        notificationsRepo = {
            create: jest.fn(),
            findByUser: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
            countUnread: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                { provide: NotificationsRepository, useValue: notificationsRepo },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a notification', async () => {
            notificationsRepo.create.mockResolvedValue(mockNotification);

            const result = await service.create({
                userId: 'user-1',
                type: 'TASK_ASSIGNED',
                title: 'New Task',
                message: 'You have been assigned a new task.',
            } as any);

            expect(result).toEqual(mockNotification);
            expect(notificationsRepo.create).toHaveBeenCalled();
        });
    });

    describe('findByUser', () => {
        it('should return notifications for user', async () => {
            notificationsRepo.findByUser.mockResolvedValue([mockNotification]);

            const result = await service.findByUser('user-1', {} as any);

            expect(result).toHaveLength(1);
            expect(result[0].userId).toBe('user-1');
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            notificationsRepo.markAsRead.mockResolvedValue(true);

            const result = await service.markAsRead('notif-1');

            expect(result).toBe(true);
            expect(notificationsRepo.markAsRead).toHaveBeenCalledWith('notif-1');
        });

        it('should return false if notification not found', async () => {
            notificationsRepo.markAsRead.mockResolvedValue(false);

            const result = await service.markAsRead('non-existent');

            expect(result).toBe(false);
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read for user', async () => {
            notificationsRepo.markAllAsRead.mockResolvedValue(undefined);

            await service.markAllAsRead('user-1');

            expect(notificationsRepo.markAllAsRead).toHaveBeenCalledWith('user-1');
        });
    });

    describe('countUnread', () => {
        it('should return unread count', async () => {
            notificationsRepo.countUnread.mockResolvedValue(5);

            const result = await service.countUnread('user-1');

            expect(result).toEqual({ count: 5 });
        });

        it('should return 0 when no unread notifications', async () => {
            notificationsRepo.countUnread.mockResolvedValue(0);

            const result = await service.countUnread('user-1');

            expect(result).toEqual({ count: 0 });
        });
    });
});
