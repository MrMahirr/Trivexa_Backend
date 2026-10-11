import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { PermissionsSql } from '../sql/permissions.sql';
import { PermissionEntity } from '../../domain/entities/permission.entity';
import { Permission } from '../../../../shared/enums/permission.enum';
import {
  getDefaultPermissionRows,
  getDefaultRolePermissionRows,
  getDefaultRoleRows,
  RbacSchemaSql,
} from '../sql/rbac.schema';
import { randomUUID } from 'crypto';

function isSchemaMissingError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const pgCode = (error as { code?: string }).code;
  return pgCode === '42P01' || pgCode === '42703';
}

@Injectable()
export class PermissionsRepository {
  constructor(private readonly dbPool: DatabasePool) {}
  private schemaEnsured = false;

  private getEnumPermissions(): PermissionEntity[] {
    return Object.values(Permission).map((permission) =>
      PermissionEntity.fromEnum(permission),
    );
  }

  private async ensureSchema(client: any): Promise<void> {
    if (this.schemaEnsured) return;

    await client.query(RbacSchemaSql.createRolesTable);
    await client.query(RbacSchemaSql.createPermissionsTable);
    await client.query(RbacSchemaSql.createRolePermissionsTable);

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

    const seedPermissions = getDefaultPermissionRows();
    for (const permission of seedPermissions) {
      await client.query(
        `
          INSERT INTO permissions (id, name, group_name, description)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (name) DO NOTHING
        `,
        [
          randomUUID(),
          permission.name,
          permission.group,
          permission.description,
        ],
      );
    }

    const seedRolePermissions = getDefaultRolePermissionRows();
    for (const rolePermission of seedRolePermissions) {
      await client.query(
        `
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT r.id, p.id
          FROM roles r
          CROSS JOIN permissions p
          WHERE UPPER(TRIM(r.name)) = UPPER(TRIM($1))
            AND UPPER(TRIM(p.name)) = UPPER(TRIM($2))
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `,
        [rolePermission.roleName, rolePermission.permissionName],
      );
    }

    this.schemaEnsured = true;
  }

  async findAll(): Promise<PermissionEntity[]> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const rows = await BaseQuery.queryMany(client, PermissionsSql.findAll);
      return rows.map(
        (r: any) =>
          new PermissionEntity(
            r.id,
            r.name,
            r.group || 'CUSTOM',
            r.description,
          ),
      );
    } catch (error) {
      if (isSchemaMissingError(error)) {
        return this.getEnumPermissions();
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async findByRoleId(roleId: string): Promise<PermissionEntity[]> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const rows = await BaseQuery.queryMany(
        client,
        PermissionsSql.findByRoleId,
        [roleId],
      );
      return rows.map(
        (r: any) =>
          new PermissionEntity(
            r.id,
            r.name,
            r.group || 'CUSTOM',
            r.description,
          ),
      );
    } catch (error) {
      if (isSchemaMissingError(error)) {
        return [];
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async assignPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      await client.query('BEGIN');
      await BaseQuery.execute(client, PermissionsSql.clearRolePermissions, [
        roleId,
      ]);

      for (const pId of permissionIds) {
        await BaseQuery.execute(client, PermissionsSql.assignPermissions, [
          roleId,
          pId,
        ]);
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
