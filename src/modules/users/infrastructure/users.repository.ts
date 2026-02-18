import { Injectable, Logger } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { User, UserEntity } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
    private readonly logger = new Logger(UsersRepository.name);

    constructor(private readonly dbPool: DatabasePool) { }

    async findAll(query: {
        page: number;
        limit: number;
        role?: string;
        department?: string;
        isActive?: string;
        search?: string;
    }): Promise<{ data: UserEntity[]; total: number }> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const conditions: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (query.role) {
                conditions.push(`role = $${paramIndex++}`);
                params.push(query.role);
            }
            if (query.department) {
                conditions.push(`department = $${paramIndex++}`);
                params.push(query.department);
            }
            if (query.isActive !== undefined) {
                conditions.push(`is_active = $${paramIndex++}`);
                params.push(query.isActive === 'true');
            }
            if (query.search) {
                conditions.push(
                    `(LOWER(email) LIKE $${paramIndex} OR LOWER(first_name) LIKE $${paramIndex} OR LOWER(last_name) LIKE $${paramIndex})`,
                );
                params.push(`%${query.search.toLowerCase()}%`);
                paramIndex++;
            }

            const whereClause = conditions.length
                ? `WHERE ${conditions.join(' AND ')}`
                : '';

            // Count query
            const countResult = await BaseQuery.queryOne<{ count: string }>(
                client,
                `SELECT COUNT(*) as count FROM users ${whereClause}`,
                params,
            );
            const total = parseInt(countResult?.count || '0', 10);

            // Data query with pagination
            const offset = (query.page - 1) * query.limit;
            params.push(query.limit, offset);
            const rows = await BaseQuery.queryMany(
                client,
                `SELECT id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at
                 FROM users ${whereClause}
                 ORDER BY created_at DESC
                 LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
                params,
            );

            return {
                data: rows.map(User.fromRow),
                total,
            };
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<UserEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at
                 FROM users WHERE id = $1`,
                [id],
            );
            return row ? User.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async findByEmail(email: string): Promise<any | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            return BaseQuery.queryOne(
                client,
                `SELECT id, email, password_hash, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at
                 FROM users WHERE email = $1`,
                [email],
            );
        } finally {
            client.release();
        }
    }

    async create(data: {
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: string;
        department?: string;
    }): Promise<UserEntity> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `INSERT INTO users (email, password_hash, first_name, last_name, role, department)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at`,
                [data.email, data.passwordHash, data.firstName, data.lastName, data.role, data.department || null],
            );
            return User.fromRow(row);
        } finally {
            client.release();
        }
    }

    async update(
        id: string,
        data: Partial<{
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            department: string;
        }>,
    ): Promise<UserEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const setClauses: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (data.email !== undefined) {
                setClauses.push(`email = $${paramIndex++}`);
                params.push(data.email);
            }
            if (data.firstName !== undefined) {
                setClauses.push(`first_name = $${paramIndex++}`);
                params.push(data.firstName);
            }
            if (data.lastName !== undefined) {
                setClauses.push(`last_name = $${paramIndex++}`);
                params.push(data.lastName);
            }
            if (data.role !== undefined) {
                setClauses.push(`role = $${paramIndex++}`);
                params.push(data.role);
            }
            if (data.department !== undefined) {
                setClauses.push(`department = $${paramIndex++}`);
                params.push(data.department);
            }

            if (setClauses.length === 0) return this.findById(id);

            setClauses.push(`updated_at = NOW()`);
            params.push(id);

            const row = await BaseQuery.queryOne(
                client,
                `UPDATE users SET ${setClauses.join(', ')}
                 WHERE id = $${paramIndex}
                 RETURNING id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at`,
                params,
            );
            return row ? User.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async deactivate(id: string): Promise<UserEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `UPDATE users SET is_active = false, updated_at = NOW()
                 WHERE id = $1
                 RETURNING id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at`,
                [id],
            );
            return row ? User.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            await BaseQuery.execute(
                client,
                `UPDATE users SET password_hash = $1, force_password_change = false, updated_at = NOW() WHERE id = $2`,
                [passwordHash, id],
            );
        } finally {
            client.release();
        }
    }

    async findPasswordHashById(id: string): Promise<string | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne<{ password_hash: string }>(
                client,
                `SELECT password_hash FROM users WHERE id = $1`,
                [id],
            );
            return row ? row.password_hash : null;
        } finally {
            client.release();
        }
    }
}
