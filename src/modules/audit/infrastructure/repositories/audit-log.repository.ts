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
  ): Promise<{ data: AuditLog[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) FROM audit_logs';
    const countResult = await this.dbPool.getPool().query(countQuery);
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
      ORDER BY audit_logs.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await this.dbPool.getPool().query(query, [limit, offset]);

    return {
      data: result.rows.map((r) => new AuditLog(r)),
      total,
    };
  }
}
