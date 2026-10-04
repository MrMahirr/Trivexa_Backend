import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PresenceService } from '../application/presence.service';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { JoinProjectDto } from '../api/dto/join-project.dto';

const GLOBAL_PRESENCE_ROOM_ID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_PRESENCE_PATH = '/app/dashboard';

interface PresencePathPayload {
  currentPath?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) || [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
  },
  namespace: '/presence',
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PresenceGateway.name);

  constructor(private readonly presenceService: PresenceService) {}

  private getSocketUser(
    client: Socket,
  ): { userId: string; email: string; displayName: string } | null {
    const raw = client.data.user as
      | {
          id?: string;
          sub?: string;
          email?: string;
          firstName?: string;
          lastName?: string;
          name?: string;
        }
      | undefined;
    const userId = raw?.sub ?? raw?.id;
    const email = raw?.email;
    const firstName = (raw?.firstName ?? '').trim();
    const lastName = (raw?.lastName ?? '').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const displayName = fullName || raw?.name?.trim() || email || userId || '';

    if (!userId || !email) {
      return null;
    }

    return { userId, email, displayName };
  }

  private normalizePath(currentPath?: string) {
    if (!currentPath || typeof currentPath !== 'string') {
      return DEFAULT_PRESENCE_PATH;
    }

    const trimmed = currentPath.trim();
    if (!trimmed.startsWith('/')) {
      return DEFAULT_PRESENCE_PATH;
    }

    return trimmed;
  }

  async handleConnection(client: Socket) {
    this.logger.debug(`Client Connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.debug(`Client Disconnected: ${client.id}`);

    const cleanupResults = await this.presenceService.removeClient(client.id);

    if (!cleanupResults || cleanupResults.length === 0) return;

    cleanupResults.forEach((cleanupResult) => {
      if (cleanupResult.projectId === GLOBAL_PRESENCE_ROOM_ID) {
        this.server.emit('globalActiveUsersUpdate', {
          activeUsers: cleanupResult.activeUsers,
        });
        return;
      }

      this.server
        .to(`project_${cleanupResult.projectId}`)
        .emit('activeUsersUpdate', {
          projectId: cleanupResult.projectId,
          activeUsers: cleanupResult.activeUsers,
        });
    });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('joinGlobalPresence')
  async handleJoinGlobalPresence(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: PresencePathPayload,
  ) {
    const socketUser = this.getSocketUser(client);
    if (!socketUser) {
      client.disconnect();
      return;
    }

    const { userId, email, displayName } = socketUser;
    const currentPath = this.normalizePath(payload?.currentPath);
    client.join(`project_${GLOBAL_PRESENCE_ROOM_ID}`);

    const activeUsers = await this.presenceService.addClientToProject(
      client.id,
      userId,
      email,
      displayName,
      currentPath,
      GLOBAL_PRESENCE_ROOM_ID,
    );

    this.server.emit('globalActiveUsersUpdate', { activeUsers });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('updateGlobalPresencePath')
  async handleUpdateGlobalPresencePath(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: PresencePathPayload,
  ) {
    const currentPath = this.normalizePath(payload?.currentPath);
    const activeUsers = await this.presenceService.updateClientPath(
      client.id,
      GLOBAL_PRESENCE_ROOM_ID,
      currentPath,
    );

    this.server.emit('globalActiveUsersUpdate', { activeUsers });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leaveGlobalPresence')
  async handleLeaveGlobalPresence(@ConnectedSocket() client: Socket) {
    client.leave(`project_${GLOBAL_PRESENCE_ROOM_ID}`);

    const activeUsers = await this.presenceService.removeClientFromProject(
      client.id,
      GLOBAL_PRESENCE_ROOM_ID,
    );

    this.server.emit('globalActiveUsersUpdate', { activeUsers });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('joinProject')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinProjectDto,
  ) {
    const socketUser = this.getSocketUser(client);
    if (!socketUser) {
      client.disconnect();
      return;
    }

    const { userId, email, displayName } = socketUser;
    const currentPath = this.normalizePath();

    client.join(`project_${payload.projectId}`);

    const activeUsers = await this.presenceService.addClientToProject(
      client.id,
      userId,
      email,
      displayName,
      currentPath,
      payload.projectId,
    );

    this.server.to(`project_${payload.projectId}`).emit('activeUsersUpdate', {
      projectId: payload.projectId,
      activeUsers,
    });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leaveProject')
  async handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinProjectDto,
  ) {
    client.leave(`project_${payload.projectId}`);

    const activeUsers = await this.presenceService.removeClientFromProject(
      client.id,
      payload.projectId,
    );

    this.server.to(`project_${payload.projectId}`).emit('activeUsersUpdate', {
      projectId: payload.projectId,
      activeUsers,
    });
  }
}
