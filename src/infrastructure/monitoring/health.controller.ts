import { Controller, Get, Injectable } from '@nestjs/common';
import { DatabasePool } from '../../database/pool';
import { RedisService } from '../cache/redis.client';

@Controller('health')
export class HealthController {
  constructor(
    private readonly dbPool: DatabasePool,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  async readiness() {
    let database = 'ok';
    let redis = 'ok';
    let status = 'ready';

    try {
      await this.dbPool.getPool().query('SELECT 1');
    } catch (e) {
      database = 'error';
      status = 'error';
    }

    try {
      const ping = await this.redisService.getClient().ping();
      if (ping !== 'PONG') throw new Error('Redis ping failed');
    } catch (e) {
      redis = 'error';
      status = 'error';
    }

    return {
      status,
      checks: {
        database,
        redis,
      },
    };
  }

  @Get('live')
  liveness() {
    return { status: 'alive' };
  }
}
