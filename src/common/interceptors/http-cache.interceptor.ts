import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../../infrastructure/cache/cache.service';

/**
 * HTTP Cache Interceptor
 *
 * Caches HTTP responses in Redis based on request path and query parameters.
 *
 * Usage:
 * ```typescript
 * @UseInterceptors(HttpCacheInterceptor)
 * @CacheKey('custom:key') // Optional custom cache key
 * @CacheTTL(600) // Optional TTL (default 300s)
 * @Get()
 * async getData() {
 *   return expensiveOperation();
 * }
 * ```
 *
 * Or disable caching for specific endpoints:
 * ```typescript
 * @NoCache()
 * @Get('sensitive')
 * async getSensitiveData() {}
 * ```
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);
  private readonly DEFAULT_TTL = 300; // 5 minutes

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // Only cache GET requests
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Check if caching is disabled for this route
    const noCache = this.reflector.get<boolean>(
      'noCache',
      context.getHandler(),
    );
    if (noCache) {
      return next.handle();
    }

    // Build cache key
    const cacheKey = this.getCacheKey(context);
    const ttl = this.getCacheTTL(context);

    // Try to get from cache
    const cachedResponse = await this.cacheService.get(cacheKey);
    if (cachedResponse !== null) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return of(cachedResponse);
    }

    // Cache miss - execute handler and cache response
    this.logger.debug(`Cache miss: ${cacheKey}`);
    return next.handle().pipe(
      tap(async (response) => {
        // Only cache successful responses
        if (response !== undefined && response !== null) {
          await this.cacheService.set(cacheKey, response, ttl);
          this.logger.debug(`Cached response: ${cacheKey} (TTL: ${ttl}s)`);
        }
      }),
    );
  }

  private getCacheKey(context: ExecutionContext): string {
    // Check for custom cache key from decorator
    const customKey = this.reflector.get<string>(
      'cacheKey',
      context.getHandler(),
    );
    if (customKey) {
      return customKey;
    }

    // Build cache key from route
    const request = context.switchToHttp().getRequest();
    const { url, user } = request;

    // Include user ID in cache key for authenticated endpoints
    const userId = user?.userId || 'anonymous';

    // Parse URL to get path and query
    const [path, query] = url.split('?');

    // Build cache key
    const keyParts = ['http', userId, path];
    if (query) {
      keyParts.push(query);
    }

    return CacheService.key(...keyParts);
  }

  private getCacheTTL(context: ExecutionContext): number {
    const ttl = this.reflector.get<number>('cacheTTL', context.getHandler());
    return ttl ?? this.DEFAULT_TTL;
  }
}

/**
 * Decorator to set custom cache key
 */
export const CacheKey = (key: string) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata('cacheKey', key, descriptor.value);
    }
  };
};

/**
 * Decorator to set cache TTL in seconds
 */
export const CacheTTL = (ttl: number) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata('cacheTTL', ttl, descriptor.value);
    }
  };
};

/**
 * Decorator to disable caching for a route
 */
export const NoCache = () => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata('noCache', true, descriptor.value);
    }
  };
};
