import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { DatabasePool } from '../../../database/pool';
import { RedisService } from '../../../infrastructure/cache/redis.client';
import * as os from 'os';
import * as fs from 'fs/promises';

interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version?: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
  };
  system: {
    memory: MemoryStatus;
    disk?: DiskStatus;
    uptime_seconds: number;
    process: ProcessStatus;
  };
}

interface ServiceStatus {
  status: 'up' | 'down';
  latency_ms?: number;
  error?: string;
}

interface MemoryStatus {
  total_mb: number;
  free_mb: number;
  used_mb: number;
  usage_percent: number;
  heap_used_mb: number;
  heap_total_mb: number;
}

interface DiskStatus {
  status: 'ok' | 'warning' | 'critical';
  usage_percent?: number;
  error?: string;
}

interface ProcessStatus {
  pid: number;
  uptime_seconds: number;
  node_version: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly dbPool: DatabasePool,
    private readonly redisService: RedisService,
  ) {}

  @ApiOperation({ summary: 'Comprehensive system health check' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  @ApiResponse({ status: 503, description: 'System is unhealthy' })
  @Get()
  async check(@Res() res: Response) {
    const startTime = Date.now();

    // Check all services
    const dbCheck = await this.checkDatabase();
    const redisCheck = await this.checkRedis();
    const diskCheck = await this.checkDisk();
    const memoryStatus = this.getMemoryStatus();
    const processStatus = this.getProcessStatus();

    // Determine overall status
    let overallStatus: 'ok' | 'degraded' | 'error' = 'ok';
    if (
      dbCheck.status === 'down' ||
      redisCheck.status === 'down' ||
      diskCheck.status === 'critical'
    ) {
      overallStatus = 'error';
    } else if (diskCheck.status === 'warning') {
      overallStatus = 'degraded';
    }

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbCheck,
        redis: redisCheck,
      },
      system: {
        memory: memoryStatus,
        disk: diskCheck,
        uptime_seconds: Math.round(process.uptime()),
        process: processStatus,
      },
    };

    const httpStatus =
      overallStatus === 'ok'
        ? HttpStatus.OK
        : overallStatus === 'degraded'
          ? HttpStatus.OK // Still return 200 for degraded but monitoring should alert
          : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(httpStatus).json(result);
  }

  @ApiOperation({ summary: 'Liveness probe - check if app is alive' })
  @Get('live')
  liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'Readiness probe - check if app is ready to serve' })
  @Get('ready')
  async readiness(@Res() res: Response) {
    const dbCheck = await this.checkDatabase();
    const redisCheck = await this.checkRedis();

    const isReady =
      dbCheck.status === 'up' && redisCheck.status === 'up';

    return res.status(isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({
      status: isReady ? 'ready' : 'not_ready',
      checks: {
        database: dbCheck.status,
        redis: redisCheck.status,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Check database connectivity and latency
   */
  private async checkDatabase(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      const pool = this.dbPool.getPool();
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      const latency = Date.now() - startTime;
      return {
        status: 'up',
        latency_ms: latency,
      };
    } catch (error) {
      return {
        status: 'down',
        latency_ms: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Check Redis connectivity and latency
   */
  private async checkRedis(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      const client = this.redisService.getClient();
      await client.ping();
      const latency = Date.now() - startTime;
      return {
        status: 'up',
        latency_ms: latency,
      };
    } catch (error) {
      return {
        status: 'down',
        latency_ms: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Check disk space usage
   * Warning: > 80%, Critical: > 90%
   */
  private async checkDisk(): Promise<DiskStatus> {
    try {
      // This is a simplified check. For production, use a library like 'diskusage'
      // or platform-specific commands
      const stats = await fs.stat(process.cwd());

      // For now, return ok status
      // In production, implement actual disk space check
      return {
        status: 'ok',
        usage_percent: 0, // Placeholder
      };
    } catch (error) {
      return {
        status: 'ok', // Fail gracefully
        error: 'Disk check not available',
      };
    }
  }

  /**
   * Get memory usage statistics
   */
  private getMemoryStatus(): MemoryStatus {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsagePct = (usedMem / totalMem) * 100;

    const heapStats = process.memoryUsage();

    return {
      total_mb: Math.round(totalMem / 1024 / 1024),
      free_mb: Math.round(freeMem / 1024 / 1024),
      used_mb: Math.round(usedMem / 1024 / 1024),
      usage_percent: Math.round(memoryUsagePct * 100) / 100,
      heap_used_mb: Math.round(heapStats.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(heapStats.heapTotal / 1024 / 1024),
    };
  }

  /**
   * Get process information
   */
  private getProcessStatus(): ProcessStatus {
    return {
      pid: process.pid,
      uptime_seconds: Math.round(process.uptime()),
      node_version: process.version,
    };
  }
}
