import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';
import jwtConfig from '../../../../config/jwt.config';
import { RefreshTokenRepository } from '../../infrastructure/refresh-token.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly usersRepo: UsersRepository,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: ConfigType<typeof jwtConfig>,
  ) {}

  async execute(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtConf.refreshSecret,
      });

      const tokenHash = this.hashToken(refreshToken);
      const isStored = await this.refreshTokenRepo.findByTokenHash(tokenHash);

      if (!isStored || isStored.user_id !== decoded.sub) {
        throw new UnauthorizedException(
          'Refresh token is invalid or does not belong to user',
        );
      }

      const user = await this.usersRepo.findById(decoded.sub);
      if (
        !user ||
        ((!user as any).isActive &&
          user.isActive === false &&
          (user as any).is_active === false)
      ) {
        throw new UnauthorizedException('User is inactive or not found');
      }

      // Format correct payload exactly like login
      const firstName = (
        ((user as any).first_name as string | undefined) ??
        user.firstName ??
        ''
      ).trim();
      const lastName = (
        ((user as any).last_name as string | undefined) ??
        user.lastName ??
        ''
      ).trim();
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

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.jwtConf.accessSecret,
          expiresIn: this.jwtConf.accessExpiration as any,
        }),
        this.jwtService.signAsync(payload, {
          secret: this.jwtConf.refreshSecret,
          expiresIn: this.jwtConf.refreshExpiration as any,
        }),
      ]);

      // Revoke old refresh token, store new one
      await this.refreshTokenRepo.revokeByTokenHash(tokenHash);

      const newHash = this.hashToken(newRefreshToken);
      const refreshExpMs = this.parseExpiration(this.jwtConf.refreshExpiration);
      const expiresAt = new Date(Date.now() + refreshExpMs);
      await this.refreshTokenRepo.create(user.id, newHash, expiresAt);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
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
