import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsRepository } from './notifications.repository';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { NotificationsSql } from './sql/notifications.sql';

describe('NotificationsRepository', () => {
  let repository: NotificationsRepository;
  let dbPool: Partial<DatabasePool>;
  let mockClient: any;

  const mockRow: any = {
    id: 'notif-1',
    user_id: 'user-1',
    type: 'TASK_ASSIGNED',
    title: 'New Task',
    message: 'You have been assigned.',
    is_read: false,
    metadata: { taskId: 'task-1' },
    created_at: new Date(),
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
        NotificationsRepository,
        { provide: DatabasePool, useValue: dbPool },
      ],
    }).compile();

    repository = module.get<NotificationsRepository>(NotificationsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should insert and return notification', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

      const result = await repository.create({
        userId: 'user-1',
        type: 'TASK_ASSIGNED',
        title: 'New Task',
        message: 'You have been assigned.',
      });

      expect(result.id).toBe('notif-1');
      expect(result.isRead).toBe(false);
      expect(BaseQuery.queryOne).toHaveBeenCalledWith(
        mockClient,
        NotificationsSql.create,
        ['user-1', 'TASK_ASSIGNED', 'New Task', 'You have been assigned.', {}],
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should pass metadata when provided', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

      await repository.create({
        userId: 'user-1',
        type: 'INFO',
        title: 'Info',
        message: 'Test',
        metadata: { key: 'value' },
      });

      expect(BaseQuery.queryOne).toHaveBeenCalledWith(
        mockClient,
        expect.any(String),
        expect.arrayContaining([{ key: 'value' }]),
      );
    });
  });

  describe('findByUser', () => {
    it('should return notifications for user', async () => {
      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([mockRow]);
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ total: '1' });

      const result = await repository.findByUser('user-1', {} as any);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].userId).toBe('user-1');
      expect(result.meta.itemCount).toBe(1);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should apply isRead filter', async () => {
      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ total: '0' });

      await repository.findByUser('user-1', { isRead: false } as any);

      expect(BaseQuery.queryMany).toHaveBeenCalledWith(
        mockClient,
        expect.stringContaining('is_read'),
        expect.arrayContaining(['user-1', false, 20, 0]),
      );
    });

    it('should apply type filter', async () => {
      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ total: '0' });

      await repository.findByUser('user-1', { type: 'TASK_ASSIGNED' } as any);

      expect(BaseQuery.queryMany).toHaveBeenCalledWith(
        mockClient,
        expect.stringContaining('type'),
        expect.arrayContaining(['user-1', 'TASK_ASSIGNED', 20, 0]),
      );
    });
  });

  describe('markAsRead', () => {
    it('should return true when notification updated', async () => {
      jest.spyOn(BaseQuery, 'execute').mockResolvedValue(1);

      const result = await repository.markAsRead('notif-1');

      expect(result).toBe(true);
      expect(BaseQuery.execute).toHaveBeenCalledWith(
        mockClient,
        NotificationsSql.markAsRead,
        ['notif-1'],
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return false when notification not found', async () => {
      jest.spyOn(BaseQuery, 'execute').mockResolvedValue(0);

      const result = await repository.markAsRead('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications for user', async () => {
      jest.spyOn(BaseQuery, 'execute').mockResolvedValue(3);

      await repository.markAllAsRead('user-1');

      expect(BaseQuery.execute).toHaveBeenCalledWith(
        mockClient,
        NotificationsSql.markAllAsRead,
        ['user-1'],
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('countUnread', () => {
    it('should return unread count', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ count: '7' });

      const result = await repository.countUnread('user-1');

      expect(result).toBe(7);
      expect(BaseQuery.queryOne).toHaveBeenCalledWith(
        mockClient,
        NotificationsSql.countUnread,
        ['user-1'],
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return 0 when count row is null', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

      const result = await repository.countUnread('user-1');

      expect(result).toBe(0);
    });
  });
});
