import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../../infrastructure/cache/redis.client';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly defaultLimit = 100;
  private readonly defaultWindow = 60; // seconds

  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const route = request.route?.path || request.url;

    // Special rate limits for auth endpoints
    let limit = this.defaultLimit;
    let window = this.defaultWindow;

    if (route.includes('/auth/login')) {
      limit = 5;
      window = 60;
    }

    const key = `ratelimit:${ip}:${route}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      // Set TTL on first request
      await this.redis.getClient().expire(key, window);
    }

    if (current > limit) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
