import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { User, UserEntity } from '../domain/user.entity';
import { UsersSql } from './sql/users.sql';

import { CacheService } from '../../../infrastructure/cache/cache.service';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly dbPool: DatabasePool,
    private readonly cacheService: CacheService,
  ) {}

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
        `${UsersSql.findAllCount} ${whereClause}`,
        params,
      );
      const total = parseInt(countResult?.count || '0', 10);

      // Data query with pagination
      const offset = (query.page - 1) * query.limit;
      params.push(query.limit, offset);
      const rows = await BaseQuery.queryMany(
        client,
        `${UsersSql.findAllData} ${whereClause}
                 ORDER BY created_at DESC
                 LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        params,
      );

      return {
        data: rows.map((row) => User.fromRow(row)),
        total,
      };
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.cacheService.getOrSet(
      `users:${id}`,
      async () => {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
          const row = await BaseQuery.queryOne(client, UsersSql.findById, [id]);
          return row ? User.fromRow(row) : null;
        } finally {
          client.release();
        }
      },
      300,
    ); // 5 minutes TTL
  }

  async findByEmail(email: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      return BaseQuery.queryOne(client, UsersSql.findByEmail, [email]);
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
      const row = await BaseQuery.queryOne(client, UsersSql.create, [
        data.email,
        data.passwordHash,
        data.firstName,
        data.lastName,
        data.role,
        data.department || null,
      ]);
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
        `${UsersSql.updateBase} ${setClauses.join(', ')}
                 WHERE id = $${paramIndex}
                 ${UsersSql.updateReturning}`,
        params,
      );

      if (row) {
        await this.cacheService.del(`users:${id}`);
      }

      return row ? User.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async deactivate(id: string): Promise<UserEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, UsersSql.deactivate, [id]);

      if (row) {
        await this.cacheService.del(`users:${id}`);
      }

      return row ? User.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async activate(id: string): Promise<UserEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, UsersSql.activate, [id]);

      if (row) {
        await this.cacheService.del(`users:${id}`);
      }

      return row ? User.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await BaseQuery.execute(client, UsersSql.updatePassword, [
        passwordHash,
        id,
      ]);
      await this.cacheService.del(`users:${id}`);
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
        UsersSql.findPasswordHashById,
        [id],
      );
      return row ? row.password_hash : null;
    } finally {
      client.release();
    }
  }
}
