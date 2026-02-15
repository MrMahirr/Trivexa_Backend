import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';

@Injectable()
export class RefreshTokenRepository {
    constructor(private readonly dbPool: DatabasePool) { }

    async create(
        userId: string,
        tokenHash: string,
        expiresAt: Date,
    ): Promise<void> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            await BaseQuery.execute(
                client,
                `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
         VALUES ($1, $2, $3)`,
                [userId, tokenHash, expiresAt],
            );
        } finally {
            client.release();
        }
    }

    async findByTokenHash(tokenHash: string): Promise<any | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            return BaseQuery.queryOne(
                client,
                `SELECT * FROM refresh_tokens 
         WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
                [tokenHash],
            );
        } finally {
            client.release();
        }
    }

    async revokeByUserId(userId: string): Promise<void> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            await BaseQuery.execute(
                client,
                `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
                [userId],
            );
        } finally {
            client.release();
        }
    }

    async revokeByTokenHash(tokenHash: string): Promise<void> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            await BaseQuery.execute(
                client,
                `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
                [tokenHash],
            );
        } finally {
            client.release();
        }
    }
}
