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

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/presence', // İzole namespace
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PresenceGateway.name);

  constructor(private readonly presenceService: PresenceService) {}

  async handleConnection(client: Socket) {
    this.logger.debug(`Client Connected: ${client.id}`);
  }

  /**
   * Soket aniden kapandığında (sayfa yenileme, ağ kopması vb.)
   */
  async handleDisconnect(client: Socket) {
    this.logger.debug(`Client Disconnected: ${client.id}`);

    // Kullanıcının bulunduğu projelerden (O(1) süreyle) temizlenmesi
    const cleanupResult = await this.presenceService.removeClient(client.id);

    // Temizlik olduysa, o progedeki diğer kullanıcılara güncel aktif listesini yayınla
    if (cleanupResult) {
      this.server
        .to(`project_${cleanupResult.projectId}`)
        .emit('activeUsersUpdate', {
          projectId: cleanupResult.projectId,
          activeUsers: cleanupResult.activeUsers,
        });
    }
  }

  /**
   * Frontend proje sayfasına girdiğinde tetiklenir
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('joinProject')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinProjectDto,
  ) {
    const user = client.data.user; // WsJwtAuthGuard tarafından JWT'den alınır

    // Socket.io room'a ekle (Broadcast işlemlerini kolaylaştırır)
    client.join(`project_${payload.projectId}`);

    // Aktif kullanıcıyı belleğe/state'e ekle
    const activeUsers = await this.presenceService.addClientToProject(
      client.id,
      user.id,
      user.email,
      payload.projectId,
    );

    // Odaya dahil olan TÜM kullanıcılara güncel listeyi ilet
    this.server.to(`project_${payload.projectId}`).emit('activeUsersUpdate', {
      projectId: payload.projectId,
      activeUsers,
    });
  }

  /**
   * Frontend proje sayfasından ayrıldığında tetiklenir
   */
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
