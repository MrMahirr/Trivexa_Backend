import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
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

  private schemaEnsured = false;

  private async ensureSchema(client: PoolClient): Promise<void> {
    if (this.schemaEnsured) return;

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS sub_department_id UUID,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS avatar_fit TEXT,
      ADD COLUMN IF NOT EXISTS avatar_position TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS department_modules (
        id UUID PRIMARY KEY,
        department_id UUID NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        team_lead_id UUID,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(department_id, name)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_sub_department_id ON users(sub_department_id);
    `);

    this.schemaEnsured = true;
  }

  async findTeamMembersByDepartment(): Promise<
    Array<{
      department: string;
      members: Array<{
        id: string;
        firstName: string;
        lastName: string;
        role: string;
        avatarUrl: string | null;
        isActive: boolean;
      }>;
    }>
  > {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);

      const rows = await BaseQuery.queryMany<{
        id: string;
        first_name: string;
        last_name: string;
        role: string;
        department: string | null;
        avatar_url: string | null;
        is_active: boolean;
      }>(
        client,
        `
          SELECT
            id,
            first_name,
            last_name,
            role,
            department,
            avatar_url,
            is_active
          FROM users
          ORDER BY
            COALESCE(department, 'UNASSIGNED') ASC,
            is_active DESC,
            first_name ASC,
            last_name ASC
        `,
      );

      const grouped = new Map<
        string,
        Array<{
          id: string;
          firstName: string;
          lastName: string;
          role: string;
          avatarUrl: string | null;
          isActive: boolean;
        }>
      >();

      rows.forEach((row) => {
        const department = row.department || 'UNASSIGNED';
        if (!grouped.has(department)) {
          grouped.set(department, []);
        }

        grouped.get(department).push({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          role: row.role,
          avatarUrl: row.avatar_url,
          isActive: row.is_active,
        });
      });

      return Array.from(grouped.entries()).map(([department, members]) => ({
        department,
        members,
      }));
    } finally {
      client.release();
    }
  }

  async findAll(query: {
    page: number;
    limit: number;
    role?: string;
    department?: string;
    subDepartmentId?: string;
    isActive?: string;
    search?: string;
  }): Promise<{ data: UserEntity[]; total: number }> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (query.role) {
        conditions.push(`u.role = $${paramIndex++}`);
        params.push(query.role);
      }
      if (query.department) {
        conditions.push(`u.department = $${paramIndex++}`);
        params.push(query.department);
      }
      if (query.subDepartmentId) {
        conditions.push(`u.sub_department_id = $${paramIndex++}`);
        params.push(query.subDepartmentId);
      }
      if (query.isActive !== undefined) {
        conditions.push(`u.is_active = $${paramIndex++}`);
        params.push(query.isActive === 'true');
      }
      if (query.search) {
        conditions.push(
          `(LOWER(u.email) LIKE $${paramIndex} OR LOWER(u.first_name) LIKE $${paramIndex} OR LOWER(u.last_name) LIKE $${paramIndex})`,
        );
        params.push(`%${query.search.toLowerCase()}%`);
        paramIndex++;
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

      const countResult = await BaseQuery.queryOne<{ count: string }>(
        client,
        `${UsersSql.findAllCount} u ${whereClause}`,
        params,
      );
      const total = parseInt(countResult?.count || '0', 10);

      const offset = (query.page - 1) * query.limit;
      params.push(query.limit, offset);
      const rows = await BaseQuery.queryMany(
        client,
        `${UsersSql.findAllData} ${whereClause}
                 ORDER BY u.created_at DESC
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
          await this.ensureSchema(client);
          const row = await BaseQuery.queryOne(client, UsersSql.findById, [id]);
          return row ? User.fromRow(row) : null;
        } finally {
          client.release();
        }
      },
      300,
    );
  }

  async findByEmail(email: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
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
    subDepartmentId?: string;
    forcePasswordChange?: boolean;
    phone?: string;
    address?: string;
    avatarUrl?: string;
  }): Promise<UserEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne(client, UsersSql.create, [
        data.email,
        data.passwordHash,
        data.firstName,
        data.lastName,
        data.role,
        data.department || null,
        data.subDepartmentId || null,
        data.forcePasswordChange ?? false,
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
      subDepartmentId: string | null;
      phone: string;
      address: string;
      avatarUrl: string | null;
      avatarFit: string | null;
      avatarPosition: string | null;
    }>,
  ): Promise<UserEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);

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
      if (data.subDepartmentId !== undefined) {
        setClauses.push(`sub_department_id = $${paramIndex++}`);
        params.push(data.subDepartmentId);
      }
      if (data.phone !== undefined) {
        setClauses.push(`phone = $${paramIndex++}`);
        params.push(data.phone);
      }
      if (data.address !== undefined) {
        setClauses.push(`address = $${paramIndex++}`);
        params.push(data.address);
      }
      if (data.avatarUrl !== undefined) {
        setClauses.push(`avatar_url = $${paramIndex++}`);
        params.push(data.avatarUrl);
      }
      if (data.avatarFit !== undefined) {
        setClauses.push(`avatar_fit = $${paramIndex++}`);
        params.push(data.avatarFit);
      }
      if (data.avatarPosition !== undefined) {
        setClauses.push(`avatar_position = $${paramIndex++}`);
        params.push(data.avatarPosition);
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
      await this.ensureSchema(client);
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
      await this.ensureSchema(client);
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
      await this.ensureSchema(client);
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
      await this.ensureSchema(client);
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

  async findUserIdsByRoles(
    roles: string[],
    client?: PoolClient,
  ): Promise<string[]> {
    if (!roles.length) return [];

    const dbClient = client || (await this.dbPool.getPool().connect());
    const shouldRelease = !client;
    try {
      const rows = await BaseQuery.queryMany<{ id: string }>(
        dbClient,
        `
          SELECT id
          FROM users
          WHERE role = ANY($1::text[])
            AND is_active = true
        `,
        [roles],
      );
      return rows.map((row) => row.id);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }
}
