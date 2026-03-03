import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../../infrastructure/cache/redis.module';
import { PresenceGateway } from './transport/presence.gateway';
import { PresenceService } from './application/presence.service';
import { WsJwtAuthGuard } from './transport/guards/ws-jwt-auth.guard';

@Module({
  imports: [AuthModule, RedisModule],
  providers: [PresenceGateway, PresenceService, WsJwtAuthGuard],
  exports: [PresenceService],
})
export class PresenceModule {}
