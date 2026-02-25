import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthTokenRepository {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async addToBlacklist(token: string, ttlMs: number): Promise<void> {
        const key = `blacklist:${token}`;
        await this.cacheManager.set(key, true, ttlMs);
    }

    async isBlacklisted(token: string): Promise<boolean> {
        const key = `blacklist:${token}`;
        const exists = await this.cacheManager.get(key);
        return !!exists;
    }
}
