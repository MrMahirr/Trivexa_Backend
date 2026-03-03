import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { AuditLog } from '../../domain/entities/audit-log.entity';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async create(log: AuditLog): Promise<void> {
    const query = `
      INSERT INTO audit_logs 
        (id, entity_name, entity_id, action, user_id, details, ip_address, user_agent, timestamp)
      VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
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
        log.userAgent || null,
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
        id, 
        entity_name as "entityName", 
        entity_id as "entityId", 
        action, 
        user_id as "userId", 
        details, 
        ip_address as "ipAddress", 
        user_agent as "userAgent", 
        timestamp
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await this.dbPool.getPool().query(query, [limit, offset]);

    return {
      data: result.rows.map((r) => new AuditLog(r)),
      total,
    };
  }
}
