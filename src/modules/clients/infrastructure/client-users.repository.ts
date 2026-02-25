import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { ClientUser, ClientUserEntity } from '../domain/client-user.entity';

@Injectable()
export class ClientUsersRepository {
    constructor(private readonly dbPool: DatabasePool) { }

    async create(data: { clientId: string; email: string; passwordHash: string }): Promise<ClientUserEntity> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `INSERT INTO client_users (client_id, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, client_id, email, password_hash, created_at`,
                [data.clientId, data.email, data.passwordHash],
            );
            return ClientUser.fromRow(row);
        } finally {
            client.release();
        }
    }

    async findByEmail(email: string): Promise<ClientUserEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT id, client_id, email, password_hash, created_at
         FROM client_users WHERE email = $1`,
                [email],
            );
            return row ? ClientUser.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async createAccessLink(clientUserId: string, token: string, expiresAt: Date): Promise<void> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            await BaseQuery.queryOne(
                client,
                `INSERT INTO client_access_links (client_user_id, token, expires_at)
         VALUES ($1, $2, $3)
         RETURNING id`,
                [clientUserId, token, expiresAt],
            );
        } finally {
            client.release();
        }
    }

    async findAccessLinkByToken(token: string): Promise<any | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT id, client_user_id, token, expires_at
         FROM client_access_links WHERE token = $1`,
                [token],
            );
            return row || null;
        } finally {
            client.release();
        }
    }

    async updatePasswordHash(clientId: string, passwordHash: string): Promise<void> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            await BaseQuery.queryOne(
                client,
                `UPDATE client_users SET password_hash = $1 WHERE id = $2 RETURNING id`,
                [passwordHash, clientId]
            );
        } finally {
            client.release();
        }
    }
}
