import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    namespace: 'notifications',
    cors: {
        origin: '*', // Adjust in production
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                this.logger.warn(`Client ${client.id} has no token`);
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });

            const userId = payload.sub;
            client.join(userId); // Join room named by userId
            this.logger.log(`Client ${client.id} connected as User ${userId}`);
        } catch (err) {
            this.logger.error(`Connection error for client ${client.id}: ${err.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client ${client.id} disconnected`);
    }

    notifyUser(userId: string, payload: any) {
        this.server.to(userId).emit('notification', payload);
    }

    private extractToken(client: Socket): string | undefined {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            return authHeader.split(' ')[1];
        }
        const queryToken = client.handshake.query.token;
        if (typeof queryToken === 'string') {
            return queryToken;
        }
        return undefined;
    }
}
