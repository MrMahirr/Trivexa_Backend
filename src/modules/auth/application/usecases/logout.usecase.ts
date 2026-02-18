import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { RefreshTokenRepository } from '../../infrastructure/refresh-token.repository';

@Injectable()
export class LogoutUseCase {
    constructor(private readonly refreshTokenRepo: RefreshTokenRepository) { }

    async execute(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);
        await this.refreshTokenRepo.revokeByTokenHash(tokenHash);
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}
