import { Injectable, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';
import jwtConfig from '../../../../config/jwt.config';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordService } from '../password.service';
import { RefreshTokenRepository } from '../../infrastructure/refresh-token.repository';
import {
  InvalidCredentialsException,
  AccountDeactivatedException,
} from '../../domain/auth.errors';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: ConfigType<typeof jwtConfig>,
  ) {}

  async execute(email: string, password: string) {
    // 1. Find user
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!user.is_active) {
      throw new AccountDeactivatedException();
    }

    // 2. Verify password
    const isPasswordValid = await this.passwordService.compare(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 3. Generate tokens
    const tokens = await this.generateTokens(user);

    // 4. Store refresh token
    const tokenHash = this.hashToken(tokens.refreshToken);
    const refreshExpMs = this.parseExpiration(this.jwtConf.refreshExpiration);
    const expiresAt = new Date(Date.now() + refreshExpMs);
    await this.refreshTokenRepo.create(user.id, tokenHash, expiresAt);

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        department: user.department,
        forcePasswordChange: user.force_password_change,
      },
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
