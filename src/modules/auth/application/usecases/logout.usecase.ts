import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { RefreshTokenRepository } from '../../infrastructure/refresh-token.repository';
import { AuthTokenRepository } from '../../infrastructure/repositories/auth-token.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly authTokenRepo: AuthTokenRepository,
  ) {}

  async execute(refreshToken: string | undefined, accessToken: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.refreshTokenRepo.revokeByTokenHash(tokenHash);
    }

    // Add to blacklist with a TTL (e.g., 15 minutes = 900000 ms)
    if (accessToken) {
      await this.authTokenRepo.addToBlacklist(accessToken, 900000);
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
