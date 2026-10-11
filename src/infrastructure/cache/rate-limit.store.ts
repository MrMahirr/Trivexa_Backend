import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.client';

interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

/**
 * Rate Limit Store with Redis Fallback
 *
 * Provides rate limiting with automatic fallback to in-memory storage
 * when Redis is unavailable. Ensures graceful degradation.
 */
@Injectable()
export class RateLimitStore {
  private readonly logger = new Logger(RateLimitStore.name);
  private readonly inMemoryStore = new Map<string, RateLimitEntry>();
  private isRedisAvailable = true;
  private lastRedisCheck = Date.now();
  private readonly REDIS_CHECK_INTERVAL = 30000; // 30 seconds

  constructor(private readonly redisService: RedisService) {
    this.startHealthCheck();
    this.startCleanupJob();
  }

  /**
   * Increment rate limit counter
   * Returns current count
   */
  async increment(key: string, ttl: number = 60): Promise<number> {
    // Try Redis first
    if (await this.checkRedisAvailability()) {
      try {
        const client = this.redisService.getClient();
        const count = await client.incr(key);
        if (count === 1) {
          await client.expire(key, ttl);
        }
        return count;
      } catch (error) {
        this.logger.warn(`Redis increment failed, falling back to memory: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to in-memory
    return this.incrementMemory(key, ttl);
  }

  /**
   * Reset rate limit for a key
   */
  async reset(key: string): Promise<void> {
    // Try Redis first
    if (await this.checkRedisAvailability()) {
      try {
        await this.redisService.del(key);
      } catch (error) {
        this.logger.warn(`Redis reset failed: ${error.message}`);
      }
    }

    // Also reset in-memory
    this.inMemoryStore.delete(key);
  }

  /**
   * Check if rate limit is exceeded
   */
  async isLimited(key: string, limit: number): Promise<boolean> {
    // Try Redis first
    if (await this.checkRedisAvailability()) {
      try {
        const value = await this.redisService.get<number>(key);
        if (value === null) return false;
        return Number(value) > limit;
      } catch (error) {
        this.logger.warn(`Redis isLimited failed, falling back to memory: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to in-memory
    const entry = this.inMemoryStore.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.inMemoryStore.delete(key);
      return false;
    }

    return entry.count > limit;
  }

  /**
   * Increment in-memory store
   */
  private incrementMemory(key: string, ttl: number): number {
    const now = Date.now();
    const entry = this.inMemoryStore.get(key);

    if (!entry || now > entry.expiresAt) {
      // Create new entry
      const newEntry: RateLimitEntry = {
        count: 1,
        expiresAt: now + ttl * 1000,
      };
      this.inMemoryStore.set(key, newEntry);
      return 1;
    }

    // Increment existing
    entry.count++;
    return entry.count;
  }

  /**
   * Check Redis availability
   * Caches result for REDIS_CHECK_INTERVAL to avoid excessive pings
   */
  private async checkRedisAvailability(): Promise<boolean> {
    const now = Date.now();

    // Use cached result if recent
    if (now - this.lastRedisCheck < this.REDIS_CHECK_INTERVAL) {
      return this.isRedisAvailable;
    }

    // Perform actual check
    try {
      const client = this.redisService.getClient();
      await client.ping();
      this.isRedisAvailable = true;
      this.lastRedisCheck = now;
      return true;
    } catch (error) {
      this.isRedisAvailable = false;
      this.lastRedisCheck = now;
      return false;
    }
  }

  /**
   * Periodic health check to detect Redis recovery
   */
  private startHealthCheck(): void {
    setInterval(async () => {
      if (!this.isRedisAvailable) {
        const available = await this.checkRedisAvailability();
        if (available) {
          this.logger.log('Redis reconnected, switching from in-memory fallback');
        }
      }
    }, this.REDIS_CHECK_INTERVAL);
  }

  /**
   * Cleanup expired in-memory entries periodically
   */
  private startCleanupJob(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.inMemoryStore.entries()) {
        if (now > entry.expiresAt) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => this.inMemoryStore.delete(key));

      if (keysToDelete.length > 0) {
        this.logger.debug(`Cleaned up ${keysToDelete.length} expired rate limit entries`);
      }
    }, 60000); // Every minute
  }

  /**
   * Get store statistics
   */
  getStats() {
    return {
      redisAvailable: this.isRedisAvailable,
      inMemoryEntries: this.inMemoryStore.size,
      lastRedisCheck: new Date(this.lastRedisCheck),
    };
  }
}
