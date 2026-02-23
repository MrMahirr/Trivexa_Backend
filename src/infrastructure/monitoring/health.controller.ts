// Health controller for monitoring
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  readiness() {
    // TODO: Check database, redis connections
    return {
      status: 'ready',
      checks: {
        database: 'ok',
        redis: 'ok',
      },
    };
  }

  @Get('live')
  liveness() {
    return { status: 'alive' };
  }
}
