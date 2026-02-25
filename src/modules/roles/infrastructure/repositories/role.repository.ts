import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { RolesSql } from '../sql/roles.sql';
import { RoleEntity } from '../../domain/entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(private readonly dbPool: DatabasePool) { }

  async findAll(): Promise<RoleEntity[]> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const rows = await BaseQuery.queryMany(client, RolesSql.findAll);
      return rows.map((r: any) => new RoleEntity(r.id, r.name, r.description));
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, RolesSql.findById, [id]);
      return row ? new RoleEntity(row.id, row.name, row.description) : null;
    } finally {
      client.release();
    }
  }

  async create(name: string, description?: string): Promise<RoleEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, RolesSql.create, [name, description]);
      return new RoleEntity(row.id, row.name, row.description);
    } finally {
      client.release();
    }
  }

  async update(id: string, name?: string, description?: string): Promise<RoleEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
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
}
