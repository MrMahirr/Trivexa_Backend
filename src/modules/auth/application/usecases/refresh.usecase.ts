import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';
import jwtConfig from '../../../../config/jwt.config';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { RefreshTokenRepository } from '../../infrastructure/refresh-token.repository';
import {
  TokenRevokedException,
  TokenExpiredException,
  AccountDeactivatedException,
} from '../../domain/auth.errors';

@Injectable()
export class RefreshUseCase {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: ConfigType<typeof jwtConfig>,
  ) {}

  async execute(refreshToken: string) {
    // 1. Hash the token and find in DB
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new TokenRevokedException();
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      throw new TokenExpiredException();
    }

    // 2. Revoke old token (rotation)
    await this.refreshTokenRepo.revokeByTokenHash(tokenHash);

    // 3. Get user
    const user = await this.usersRepo.findById(storedToken.user_id);

    if (!user || !user.isActive) {
      throw new AccountDeactivatedException();
    }

    // 4. Generate new token pair
    const tokens = await this.generateTokens(user);

    // 5. Store new refresh token
    const newTokenHash = this.hashToken(tokens.refreshToken);
    const refreshExpMs = this.parseExpiration(this.jwtConf.refreshExpiration);
    const expiresAt = new Date(Date.now() + refreshExpMs);
    await this.refreshTokenRepo.create(user.id, newTokenHash, expiresAt);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async generateTokens(user: any) {
    const firstName = (user.first_name ?? user.firstName ?? '').trim();
    const lastName = (user.last_name ?? user.lastName ?? '').trim();
    const name = `${firstName} ${lastName}`.trim();

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      firstName,
      lastName,
      name: name || user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtConf.accessSecret,
        expiresIn: this.jwtConf.accessExpiration as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtConf.refreshSecret,
        expiresIn: this.jwtConf.refreshExpiration as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[unit] || 1000);
  }
}
