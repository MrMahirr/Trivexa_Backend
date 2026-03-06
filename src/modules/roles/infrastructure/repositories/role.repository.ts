import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { RolesSql } from '../sql/roles.sql';
import { RoleEntity } from '../../domain/entities/role.entity';
import { Role } from '../../../../shared/enums/role.enum';
import { getDefaultRoleRows, RbacSchemaSql } from '../sql/rbac.schema';
import { randomUUID } from 'crypto';

function isSchemaMissingError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const pgCode = (error as { code?: string }).code;
  return pgCode === '42P01' || pgCode === '42703';
}

@Injectable()
export class RolesRepository {
  constructor(private readonly dbPool: DatabasePool) {}
  private schemaEnsured = false;

  private getEnumRoles(): RoleEntity[] {
    return Object.values(Role).map((role) => RoleEntity.fromEnum(role));
  }

  private async ensureSchema(client: any): Promise<void> {
    if (this.schemaEnsured) return;

    await client.query(RbacSchemaSql.createRolesTable);

    const seedRoles = getDefaultRoleRows();
    for (const role of seedRoles) {
      await client.query(
        `
          INSERT INTO roles (id, name, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (name) DO NOTHING
        `,
        [randomUUID(), role.name, role.description],
      );
    }

    this.schemaEnsured = true;
  }

  async findAll(): Promise<RoleEntity[]> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const rows = await BaseQuery.queryMany(client, RolesSql.findAll);
      return rows.map((r: any) => new RoleEntity(r.id, r.name, r.description));
    } catch (error) {
      if (isSchemaMissingError(error)) {
        return this.getEnumRoles();
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne(client, RolesSql.findById, [id]);
      return row ? new RoleEntity(row.id, row.name, row.description) : null;
    } catch (error) {
      if (isSchemaMissingError(error)) {
        return this.getEnumRoles().find((role) => role.id === id) ?? null;
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async create(name: string, description?: string): Promise<RoleEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne(client, RolesSql.create, [
        randomUUID(),
        name,
        description,
      ]);
      return new RoleEntity(row.id, row.name, row.description);
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    name?: string,
    description?: string,
  ): Promise<RoleEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) {
        setClauses.push(`name = $${paramIndex++}`);
        params.push(name);
      }
      if (description !== undefined) {
        setClauses.push(`description = $${paramIndex++}`);
        params.push(description);
      }

      if (setClauses.length === 0) return this.findById(id);

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const row = await BaseQuery.queryOne(
        client,
        `${RolesSql.updateBase} ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, description`,
        params,
      );

      return row ? new RoleEntity(row.id, row.name, row.description) : null;
    } finally {
      client.release();
    }
  }

  async deleteById(id: string): Promise<boolean> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne(client, RolesSql.delete, [id]);
      return !!row;
    } finally {
      client.release();
    }
  }

  async countUsersByRoleName(roleName: string): Promise<number> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne<{ count: string }>(
        client,
        `
          SELECT COUNT(*)::text as count
          FROM users
          WHERE UPPER(TRIM(role)) = UPPER(TRIM($1))
        `,
        [roleName],
      );
      return Number(row?.count ?? 0);
    } finally {
      client.release();
    }
  }
}
