import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { TimeEntry, TimeEntryEntity } from '../../domain/time-entry.entity';

@Injectable()
export class ListTimeEntriesQuery {
    constructor(private readonly dbPool: DatabasePool) { }

    async execute(
        queryDto: {
            page?: number;
            limit?: number;
            userId?: string;
            projectId?: string;
            startDate?: string;
            endDate?: string;
        },
        currentUserId: string,
        role: string
    ): Promise<{ data: TimeEntryEntity[]; total: number }> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();

        try {
            const page = queryDto.page || 1;
            const limit = queryDto.limit || 10;
            const offset = (page - 1) * limit;

            const conditions: string[] = [];
            const params: any[] = [];
            let idx = 1;

            // 1. RBAC (Role Based Access) Checking
            if (role !== 'ADMIN' && role !== 'MANAGER') {
                conditions.push(`te.user_id = $${idx++}`);
                params.push(currentUserId);
            } else if (queryDto.userId) {
                conditions.push(`te.user_id = $${idx++}`);
                params.push(queryDto.userId);
            }

            // 2. Filters
            if (queryDto.projectId) {
                conditions.push(`te.project_id = $${idx++}`);
                params.push(queryDto.projectId);
            }

            if (queryDto.startDate && queryDto.endDate) {
                conditions.push(`te.start_time >= $${idx++} AND te.start_time <= $${idx++}`);
                params.push(queryDto.startDate, queryDto.endDate);
            }

            const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            const countSql = `SELECT COUNT(*) FROM time_entries te ${where}`;
            const countResult = await BaseQuery.queryOne<{ count: string }>(client, countSql, params);
            const total = parseInt(countResult?.count || '0', 10);

            params.push(limit, offset);

            const dataSql = `
        SELECT 
          te.*,
          p.name as project_name,
          t.title as task_title,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email
        FROM time_entries te
        LEFT JOIN projects p ON te.project_id = p.id
        LEFT JOIN tasks t ON te.task_id = t.id
        LEFT JOIN users u ON te.user_id = u.id
        ${where}
        ORDER BY te.start_time DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;

            const rows = await BaseQuery.queryMany(client, dataSql, params);
            return { data: rows.map(r => TimeEntry.fromRow(r)), total };

        } finally {
            client.release();
        }
    }
}
