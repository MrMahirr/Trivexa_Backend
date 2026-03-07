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

@WebSocketGateway({
  cors: { origin: '*' },
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
  ): { userId: string; email: string } | null {
    const raw = client.data.user as
      | { id?: string; sub?: string; email?: string }
      | undefined;
    const userId = raw?.sub ?? raw?.id;
    const email = raw?.email;

    if (!userId || !email) {
      return null;
    }

    return { userId, email };
  }

  async handleConnection(client: Socket) {
    this.logger.debug(`Client Connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.debug(`Client Disconnected: ${client.id}`);

    const cleanupResult = await this.presenceService.removeClient(client.id);

    if (cleanupResult) {
      if (cleanupResult.projectId === GLOBAL_PRESENCE_ROOM_ID) {
        this.server.emit('globalActiveUsersUpdate', {
          activeUsers: cleanupResult.activeUsers,
        });
      } else {
        this.server
          .to(`project_${cleanupResult.projectId}`)
          .emit('activeUsersUpdate', {
            projectId: cleanupResult.projectId,
            activeUsers: cleanupResult.activeUsers,
          });
      }
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('joinGlobalPresence')
  async handleJoinGlobalPresence(@ConnectedSocket() client: Socket) {
    const socketUser = this.getSocketUser(client);
    if (!socketUser) {
      client.disconnect();
      return;
    }

    const { userId, email } = socketUser;
    client.join(`project_${GLOBAL_PRESENCE_ROOM_ID}`);

    const activeUsers = await this.presenceService.addClientToProject(
      client.id,
      userId,
      email,
      GLOBAL_PRESENCE_ROOM_ID,
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

    const { userId, email } = socketUser;

    client.join(`project_${payload.projectId}`);

    const activeUsers = await this.presenceService.addClientToProject(
      client.id,
      userId,
      email,
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
