import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { AuditLog } from '../../domain/entities/audit-log.entity';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async create(log: AuditLog): Promise<void> {
    const query = `
      INSERT INTO audit_logs 
        (id, resource, resource_id, action, user_id, new_data, ip_address, created_at)
      VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
    `;

    await this.dbPool
      .getPool()
      .query(query, [
        log.entityName,
        log.entityId || null,
        log.action,
        log.userId || null,
        log.details ? JSON.stringify(log.details) : null,
        log.ipAddress || null,
        log.timestamp,
      ]);
  }

  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      action?: string;
      entity?: string;
      userId?: string;
    },
  ): Promise<{ data: AuditLog[]; total: number }> {
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filters?.action) {
      conditions.push(
        `(audit_logs.action ILIKE $${idx} OR COALESCE(audit_logs.new_data ->> 'eventType', '') ILIKE $${idx})`,
      );
      params.push(`%${filters.action}%`);
      idx++;
    }

    if (filters?.entity) {
      conditions.push(`UPPER(audit_logs.resource) = UPPER($${idx})`);
      params.push(filters.entity);
      idx++;
    }

    if (filters?.userId) {
      conditions.push(`audit_logs.user_id = $${idx}`);
      params.push(filters.userId);
      idx++;
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const countQuery = `SELECT COUNT(*) FROM audit_logs ${whereClause}`;
    const countResult = await this.dbPool.getPool().query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const query = `
      SELECT 
        audit_logs.id, 
        audit_logs.resource as "entityName", 
        audit_logs.resource_id as "entityId", 
        audit_logs.action, 
        audit_logs.user_id as "userId", 
        users.first_name || ' ' || users.last_name as "userName",
        audit_logs.new_data as "details", 
        audit_logs.ip_address as "ipAddress", 
        NULL as "userAgent", 
        audit_logs.created_at as "timestamp"
      FROM audit_logs
      LEFT JOIN users ON users.id = audit_logs.user_id
      ${whereClause}
      ORDER BY audit_logs.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const result = await this.dbPool
      .getPool()
      .query(query, [...params, limit, offset]);

    return {
      data: result.rows.map((r) => new AuditLog(r)),
      total,
    };
  }

  async archiveOlderThan(retentionDays: number): Promise<{
    archivedCount: number;
    deletedCount: number;
  }> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_logs_archive (
          LIKE audit_logs INCLUDING ALL
        );
      `);

      const archivedResult = await client.query(
        `
          INSERT INTO audit_logs_archive
          SELECT *
          FROM audit_logs
          WHERE created_at < (NOW() - ($1 || ' days')::interval)
          ON CONFLICT (id) DO NOTHING
        `,
        [retentionDays],
      );

      const deletedResult = await client.query(
        `
          DELETE FROM audit_logs
          WHERE created_at < (NOW() - ($1 || ' days')::interval)
        `,
        [retentionDays],
      );

      await client.query('COMMIT');

      return {
        archivedCount: archivedResult.rowCount ?? 0,
        deletedCount: deletedResult.rowCount ?? 0,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
