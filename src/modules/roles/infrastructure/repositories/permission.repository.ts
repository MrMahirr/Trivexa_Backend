import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { PermissionsSql } from '../sql/permissions.sql';
import { PermissionEntity } from '../../domain/entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly dbPool: DatabasePool) { }

  async findAll(): Promise<PermissionEntity[]> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const rows = await BaseQuery.queryMany(client, PermissionsSql.findAll);
      return rows.map((r: any) => new PermissionEntity(r.id, r.name, r.group || 'CUSTOM', r.description));
    } finally {
      client.release();
    }
  }

  async findByRoleId(roleId: string): Promise<PermissionEntity[]> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const rows = await BaseQuery.queryMany(client, PermissionsSql.findByRoleId, [roleId]);
      return rows.map((r: any) => new PermissionEntity(r.id, r.name, r.group || 'CUSTOM', r.description));
    } finally {
      client.release();
    }
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await BaseQuery.execute(client, PermissionsSql.clearRolePermissions, [roleId]);

      for (const pId of permissionIds) {
        await BaseQuery.execute(client, PermissionsSql.assignPermissions, [roleId, pId]);
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
