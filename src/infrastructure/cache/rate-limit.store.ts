import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.client';

@Injectable()
export class RateLimitStore {
  constructor(private readonly redisService: RedisService) {}

  async increment(key: string, ttl: number = 60): Promise<number> {
    const client = this.redisService.getClient();
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, ttl);
    }
    return count;
  }

  async reset(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async isLimited(key: string, limit: number): Promise<boolean> {
    const value = await this.redisService.get<number>(key);
    if (value === null) return false;
    return Number(value) > limit;
  }
}
