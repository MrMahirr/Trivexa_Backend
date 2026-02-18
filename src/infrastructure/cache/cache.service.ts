import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.client';

@Injectable()
export class CacheService {
    constructor(private readonly redisService: RedisService) { }

    async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
        const cached = await this.redisService.get<T>(key);
        if (cached) {
            return cached;
        }

        const value = await fetcher();
        await this.redisService.set(key, value, ttl);
        return value;
    }

    async del(key: string): Promise<void> {
        await this.redisService.del(key);
    }
}
