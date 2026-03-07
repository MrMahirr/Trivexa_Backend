import { PresenceService } from './presence.service';

describe('PresenceService', () => {
  let service: PresenceService;
  const mockRedisService = {} as any;

  beforeEach(() => {
    service = new PresenceService(mockRedisService);
  });

  afterEach(() => {
    // Clear internal maps between tests
    (service as any).projectPresence.clear();
    (service as any).clientMap.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addClientToProject', () => {
    it('should add a user to a project and return active users list', async () => {
      const result = await service.addClientToProject(
        'socket-1',
        'user-1',
        'test@example.com',
        'Test User',
        '/app/test',
        'project-1',
      );

      expect(result).toEqual([
        {
          userId: 'user-1',
          email: 'test@example.com',
          displayName: 'Test User',
          currentPath: '/app/test',
        },
      ]);
    });

    it('should not duplicate user on multi-tab (same userId, different clientId)', async () => {
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );
      const result = await service.addClientToProject(
        'socket-2',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );

      // Only 1 unique user should appear
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-1');
    });

    it('should list multiple different users in the same project', async () => {
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );
      const result = await service.addClientToProject(
        'socket-2',
        'user-2',
        'c@d.com',
        'User Two',
        '/app/tasks',
        'project-1',
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('removeClientFromProject', () => {
    it('should remove user when last tab is closed', async () => {
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );
      const result = await service.removeClientFromProject(
        'socket-1',
        'project-1',
      );

      expect(result).toHaveLength(0);
    });

    it('should keep user if another tab is still open', async () => {
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );
      await service.addClientToProject(
        'socket-2',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );

      const result = await service.removeClientFromProject(
        'socket-1',
        'project-1',
      );

      // User still has socket-2 open
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-1');
    });

    it('should remove only the requested room when same socket joined multiple rooms', async () => {
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'global-room',
      );
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );

      const globalResult = await service.removeClientFromProject(
        'socket-1',
        'global-room',
      );
      expect(globalResult).toHaveLength(0);

      const disconnectResult = await service.removeClient('socket-1');
      expect(disconnectResult).toEqual([
        { projectId: 'project-1', activeUsers: [] },
      ]);
    });
  });

  describe('removeClient (disconnect)', () => {
    it('should return null if client was not tracked', async () => {
      const result = await service.removeClient('unknown-socket');
      expect(result).toBeNull();
    });

    it('should cleanup user and return projectId + active users', async () => {
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );
      const result = await service.removeClient('socket-1');

      expect(result).toEqual([
        {
          projectId: 'project-1',
          activeUsers: [],
        },
      ]);
    });

    it('should only remove disconnected user, keep others', async () => {
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );
      await service.addClientToProject(
        'socket-2',
        'user-2',
        'c@d.com',
        'User Two',
        '/app/tasks',
        'project-1',
      );

      const result = await service.removeClient('socket-1');

      expect(result).toHaveLength(1);
      expect(result![0].activeUsers).toHaveLength(1);
      expect(result![0].activeUsers[0].userId).toBe('user-2');
    });

    it('should cleanup all joined rooms for the same socket', async () => {
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'global-room',
      );
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'project-1',
      );

      const result = await service.removeClient('socket-1');

      expect(result).toEqual(
        expect.arrayContaining([
          { projectId: 'global-room', activeUsers: [] },
          { projectId: 'project-1', activeUsers: [] },
        ]),
      );
    });
  });

  describe('updateClientPath', () => {
    it('should update currentPath for the active user', async () => {
      await service.addClientToProject(
        'socket-1',
        'user-1',
        'a@b.com',
        'User One',
        '/app/dashboard',
        'global-room',
      );

      const result = await service.updateClientPath(
        'socket-1',
        'global-room',
        '/app/projeler',
      );

      expect(result).toEqual([
        {
          userId: 'user-1',
          email: 'a@b.com',
          displayName: 'User One',
          currentPath: '/app/projeler',
        },
      ]);
    });
  });
});


