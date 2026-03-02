import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/cache/redis.client';

export interface ActiveUser {
  userId: string;
  email: string;
  connections: string[]; // multi-tab desteği (socket/client id array'i)
}

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);

  // production: Multi-instance için Redis kullanılmalıdır.
  // Şimdilik Map yapısını Redis abstraction'ı gibi kurguluyoruz.
  // Record<projectId, Map<userId, ActiveUser>>
  private readonly projectPresence = new Map<string, Map<string, ActiveUser>>();

  // Mapping of clientId -> { projectId, userId } for fast disconnect lookup (O(1) cost)
  private readonly clientMap = new Map<
    string,
    { projectId: string; userId: string }
  >();

  // Not: redisService dependency hazır bekletiliyor.
  // İleride RedisAdapter veya Redis tabanlı Hash kullanmak için.
  constructor(private readonly redisService: RedisService) {}

  /**
   * Kullanıcı projeye girdiğinde tetiklenir.
   */
  async addClientToProject(
    clientId: string,
    userId: string,
    email: string,
    projectId: string,
  ) {
    let projectUsers = this.projectPresence.get(projectId);

    // Proje odası ilk kez oluşturuluyorsa
    if (!projectUsers) {
      projectUsers = new Map();
      this.projectPresence.set(projectId, projectUsers);
    }

    let user = projectUsers.get(userId);

    // Kullanıcı bu projeye ilk sekmesinden giriyorsa
    if (!user) {
      user = { userId, email, connections: [] };
      projectUsers.set(userId, user);
    }

    // Connect array'e socket/client id ekle (Multi-tab için)
    if (!user.connections.includes(clientId)) {
      user.connections.push(clientId);
    }

    // O(1) disconnect araması için map'e kaydet
    this.clientMap.set(clientId, { projectId, userId });

    this.logger.debug(
      `User ${email} joined project ${projectId} (tabs: ${user.connections.length})`,
    );

    return Array.from(projectUsers.values()).map((u) => ({
      userId: u.userId,
      email: u.email,
    }));
  }

  /**
   * Belli bir projeden çıkış yapıldığında (leaveProject veya sekme kapatılma)
   */
  async removeClientFromProject(clientId: string, projectId: string) {
    const mapping = this.clientMap.get(clientId);
    if (!mapping) return [];

    const { userId } = mapping;
    const projectUsers = this.projectPresence.get(projectId);

    if (projectUsers) {
      const user = projectUsers.get(userId);
      if (user) {
        // İlgili tab (socket) bağlantısını temizle
        user.connections = user.connections.filter((id) => id !== clientId);

        // Eğer hiçbir tab/bağlantı kalmadıysa kullanıcıyı odadan çıkar
        if (user.connections.length === 0) {
          projectUsers.delete(userId);
          this.logger.debug(
            `User ${user.email} completly left project ${projectId}`,
          );
        }
      }

      // Proje odasında kimse kalmadıysa odayı temizle (Memory leak'i önle)
      if (projectUsers.size === 0) {
        this.projectPresence.delete(projectId);
        this.logger.debug(`Project room ${projectId} cleaned up (empty)`);
      }
    }

    this.clientMap.delete(clientId);

    return projectUsers
      ? Array.from(projectUsers.values()).map((u) => ({
          userId: u.userId,
          email: u.email,
        }))
      : [];
  }

  /**
   * İnternet kopması vs. nedeniyle aniden kopan soketi bul ve temizle.
   */
  async removeClient(clientId: string) {
    const mapping = this.clientMap.get(clientId);
    if (!mapping) return null;

    const activeUsers = await this.removeClientFromProject(
      clientId,
      mapping.projectId,
    );
    return { projectId: mapping.projectId, activeUsers };
  }
}
