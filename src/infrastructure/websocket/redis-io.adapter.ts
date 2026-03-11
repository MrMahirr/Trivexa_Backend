import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Redis-backed Socket.io Adapter for horizontal scaling.
 *
 * Birden fazla backend instance'ı çalıştığında (Kubernetes, PM2 cluster vb.),
 * Socket.io eventlerinin tüm instance'lara broadcast edilmesini sağlar.
 *
 * Gerekli paketler (opsiyonel — sadece horizontal scaling gerektiğinde yükleyin):
 * ```
 * npm install @socket.io/redis-adapter redis
 * ```
 *
 * Kullanım (main.ts):
 * ```
 * const redisAdapter = new RedisIoAdapter(app);
 * await redisAdapter.connectToRedis();
 * app.useWebSocketAdapter(redisAdapter);
 * ```
 */
export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);

  private adapterConstructor: any;

  constructor(
    app: INestApplication,
    private readonly configService?: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const host = this.configService?.get<string>('redis.host') || 'localhost';
    const port = this.configService?.get<number>('redis.port') || 6379;

    try {
      // Dynamic import — paketler kurulu değilse hata vermez
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createAdapter } = require('@socket.io/redis-adapter');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('redis');

      const pubClient = createClient({ url: `redis://${host}:${port}` });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log(
        `✅ Redis Adapter connected (${host}:${port}) — Horizontal scaling enabled`,
      );
    } catch {
      this.logger.warn(
        '⚠️ @socket.io/redis-adapter not installed. Running in single-instance mode.',
      );
    }
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }
}
