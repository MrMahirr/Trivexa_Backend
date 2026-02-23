import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { AuditLog } from '../domain/audit-log.entity';
import { AuditSql } from './sql/audit.sql';

@Injectable()
export class AuditRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, AuditSql.create, [
        data.userId,
        data.action,
        data.resource,
        data.resourceId,
        data.oldData || null,
        data.newData || null,
        data.ipAddress || null,
        data.userAgent || null,
      ]);
      return new AuditLog(this.mapRow(row));
    } finally {
      client.release();
    }
  }

  private mapRow(row: any): Partial<AuditLog> {
    return {
      id: row.id,
      userId: row.user_id,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id,
      oldData: row.old_data,
      newData: row.new_data,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    };
  }
}
