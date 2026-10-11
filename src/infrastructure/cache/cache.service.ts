import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.client';

/**
 * Cache Service - High-level caching utilities
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisService.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.warn(`Cache get failed: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redisService.set(key, serialized, ttl);
    } catch (error) {
      this.logger.warn(`Cache set failed: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
    } catch (error) {
      this.logger.warn(`Cache del failed: ${error.message}`);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = 300,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache hit: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache miss: ${key}`);
    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  static key(...parts: (string | number)[]): string {
    return parts.join(':');
  }
}
