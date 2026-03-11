import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/cache/redis.client';

export interface ActiveUser {
  userId: string;
  email: string;
  displayName: string;
  currentPath: string;
  connections: string[]; // socket ids (multi-tab support)
}

export interface PresenceCleanupResult {
  projectId: string;
  activeUsers: Array<{
    userId: string;
    email: string;
    displayName: string;
    currentPath: string;
  }>;
}

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);

  // Record<projectId, Map<userId, ActiveUser>>
  private readonly projectPresence = new Map<string, Map<string, ActiveUser>>();

  // clientId -> user + joined project ids
  private readonly clientMap = new Map<
    string,
    { userId: string; projectIds: Set<string> }
  >();

  // redis service is reserved for future distributed presence support
  constructor(private readonly redisService: RedisService) {}

  async addClientToProject(
    clientId: string,
    userId: string,
    email: string,
    displayName: string,
    currentPath: string,
    projectId: string,
  ) {
    let projectUsers = this.projectPresence.get(projectId);
    if (!projectUsers) {
      projectUsers = new Map();
      this.projectPresence.set(projectId, projectUsers);
    }

    let user = projectUsers.get(userId);
    if (!user) {
      user = {
        userId,
        email,
        displayName,
        currentPath,
        connections: [],
      };
      projectUsers.set(userId, user);
    } else if (user.displayName !== displayName) {
      user.displayName = displayName;
    }

    user.currentPath = currentPath;

    if (!user.connections.includes(clientId)) {
      user.connections.push(clientId);
    }

    const existingMapping = this.clientMap.get(clientId);
    if (existingMapping && existingMapping.userId !== userId) {
      this.logger.warn(
        `Client ${clientId} is remapped from user ${existingMapping.userId} to ${userId}`,
      );
    }

    const nextProjectIds = new Set(existingMapping?.projectIds ?? []);
    nextProjectIds.add(projectId);
    this.clientMap.set(clientId, {
      userId,
      projectIds: nextProjectIds,
    });

    this.logger.debug(
      `User ${email} joined project ${projectId} (tabs: ${user.connections.length})`,
    );

    return this.getProjectActiveUsers(projectId);
  }

  async removeClientFromProject(clientId: string, projectId: string) {
    const mapping = this.clientMap.get(clientId);
    if (!mapping) {
      return this.getProjectActiveUsers(projectId);
    }

    if (!mapping.projectIds.has(projectId)) {
      return this.getProjectActiveUsers(projectId);
    }

    const activeUsers = this.cleanupProjectConnection(
      clientId,
      mapping.userId,
      projectId,
    );

    mapping.projectIds.delete(projectId);
    if (mapping.projectIds.size === 0) {
      this.clientMap.delete(clientId);
    } else {
      this.clientMap.set(clientId, mapping);
    }

    return activeUsers;
  }

  async removeClient(
    clientId: string,
  ): Promise<PresenceCleanupResult[] | null> {
    const mapping = this.clientMap.get(clientId);
    if (!mapping) return null;

    const cleanupResults: PresenceCleanupResult[] = [];
    const projectIds = Array.from(mapping.projectIds);

    projectIds.forEach((projectId) => {
      const activeUsers = this.cleanupProjectConnection(
        clientId,
        mapping.userId,
        projectId,
      );

      cleanupResults.push({
        projectId,
        activeUsers,
      });
    });

    this.clientMap.delete(clientId);
    return cleanupResults;
  }

  private cleanupProjectConnection(
    clientId: string,
    userId: string,
    projectId: string,
  ): Array<{
    userId: string;
    email: string;
    displayName: string;
    currentPath: string;
  }> {
    const projectUsers = this.projectPresence.get(projectId);
    if (!projectUsers) {
      return [];
    }

    const user = projectUsers.get(userId);
    if (user) {
      user.connections = user.connections.filter((id) => id !== clientId);

      if (user.connections.length === 0) {
        projectUsers.delete(userId);
        this.logger.debug(
          `User ${user.email} completely left project ${projectId}`,
        );
      }
    }

    if (projectUsers.size === 0) {
      this.projectPresence.delete(projectId);
      this.logger.debug(`Project room ${projectId} cleaned up (empty)`);
      return [];
    }

    return Array.from(projectUsers.values()).map((activeUser) => ({
      userId: activeUser.userId,
      email: activeUser.email,
      displayName: activeUser.displayName,
      currentPath: activeUser.currentPath,
    }));
  }

  async updateClientPath(
    clientId: string,
    projectId: string,
    currentPath: string,
  ) {
    const mapping = this.clientMap.get(clientId);
    if (!mapping || !mapping.projectIds.has(projectId)) {
      return this.getProjectActiveUsers(projectId);
    }

    const projectUsers = this.projectPresence.get(projectId);
    if (!projectUsers) {
      return [];
    }

    const user = projectUsers.get(mapping.userId);
    if (!user) {
      return this.getProjectActiveUsers(projectId);
    }

    user.currentPath = currentPath;
    return this.getProjectActiveUsers(projectId);
  }

  private getProjectActiveUsers(projectId: string) {
    const projectUsers = this.projectPresence.get(projectId);
    if (!projectUsers) {
      return [];
    }

    return Array.from(projectUsers.values()).map((activeUser) => ({
      userId: activeUser.userId,
      email: activeUser.email,
      displayName: activeUser.displayName,
      currentPath: activeUser.currentPath,
    }));
  }
}
