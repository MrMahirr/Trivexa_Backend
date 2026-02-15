import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';
import jwtConfig from '../../../config/jwt.config';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { PasswordService } from './password.service';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository';
import {
    InvalidCredentialsException,
    TokenExpiredException,
    TokenRevokedException,
    AccountDeactivatedException,
} from '../domain/auth.errors';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService,
        private readonly refreshTokenRepo: RefreshTokenRepository,
        private readonly dbPool: DatabasePool,
        @Inject(jwtConfig.KEY)
        private readonly jwtConf: ConfigType<typeof jwtConfig>,
    ) { }

    async login(email: string, password: string) {
        // 1. Find user by email
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        let user: any;
        try {
            user = await BaseQuery.queryOne(
                client,
                `SELECT id, email, password_hash, first_name, last_name, role, department, is_active, force_password_change 
         FROM users WHERE email = $1`,
                [email],
            );
        } finally {
            client.release();
        }

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

    async refresh(refreshToken: string) {
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
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        let user: any;
        try {
            user = await BaseQuery.queryOne(
                client,
                `SELECT id, email, first_name, last_name, role, department, is_active, force_password_change 
         FROM users WHERE id = $1`,
                [storedToken.user_id],
            );
        } finally {
            client.release();
        }

        if (!user || !user.is_active) {
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

    async logout(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);
        await this.refreshTokenRepo.revokeByTokenHash(tokenHash);
    }

    async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string,
    ) {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            // 1. Get user
            const user = await BaseQuery.queryOne<any>(
                client,
                `SELECT id, password_hash FROM users WHERE id = $1`,
                [userId],
            );

            if (!user) {
                throw new InvalidCredentialsException();
            }

            // 2. Verify old password
            const isOldValid = await this.passwordService.compare(
                oldPassword,
                user.password_hash,
            );
            if (!isOldValid) {
                throw new InvalidCredentialsException();
            }

            // 3. Hash new password and update
            const newHash = await this.passwordService.hash(newPassword);
            await BaseQuery.execute(
                client,
                `UPDATE users SET password_hash = $1, force_password_change = false, updated_at = NOW() WHERE id = $2`,
                [newHash, userId],
            );

            // 4. Revoke all refresh tokens
            await this.refreshTokenRepo.revokeByUserId(userId);
        } finally {
            client.release();
        }

        return { message: 'Password changed successfully' };
    }

    private async generateTokens(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            department: user.department,
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
