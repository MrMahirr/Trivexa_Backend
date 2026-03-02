import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);

    if (!token) {
      this.logger.warn(`Connection rejected: No token provided (${client.id})`);
      throw new WsException('Unauthorized');
    }

    try {
      const secret = this.configService.get<string>('jwt.accessSecret');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Kullanıcıyı socket.data'ya attach ediyoruz (Request.user mantığı gibi)
      client.data.user = payload;
      return true;
    } catch (err: any) {
      this.logger.error(
        `Token validation failed for client ${client.id}: ${err.message}`,
      );
      throw new WsException('Unauthorized: Invalid token');
    }
  }

  private extractTokenFromHeader(client: Socket): string | null {
    // 1. Handshake Auth kontrolü (önerilen Socket.io auth yöntemi)
    if (client.handshake.auth && client.handshake.auth.token) {
      return client.handshake.auth.token;
    }

    // 2. Extra headers kontrolü (bazı client'lar Authorization header Bearer gönderir)
    const authorization = client.handshake.headers.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.split(' ')[1];
    }

    return null;
  }
}
