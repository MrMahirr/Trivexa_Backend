import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DatabasePool } from '../../database/pool';
import { RedisService } from '../../infrastructure/cache/redis.client';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly dbPool: DatabasePool,
        private readonly redisService: RedisService,
    ) { }

    @ApiOperation({ summary: 'Check system health' })
    @Get()
    async check() {
        const dbStatus = await this.checkDatabase();
        const redisStatus = await this.checkRedis();

        return {
            status: dbStatus === 'up' && redisStatus === 'up' ? 'ok' : 'error',
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                redis: redisStatus,
            },
        };
    }

    private async checkDatabase(): Promise<'up' | 'down'> {
        try {
            const pool = this.dbPool.getPool();
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            return 'up';
        } catch (error) {
            return 'down';
        }
    }

    private async checkRedis(): Promise<'up' | 'down'> {
        try {
            await this.redisService.get('health_check');
            return 'up';
        } catch (error) {
            return 'down';
        }
    }
}
