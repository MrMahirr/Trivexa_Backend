import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { TimeEntry, TimeEntryEntity } from '../domain/time-entry.entity';

@Injectable()
export class TimeEntriesRepository {
    constructor(private readonly dbPool: DatabasePool) { }

    async findActiveTimer(userId: string): Promise<TimeEntryEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT t.*,
                        p.name as project_name,
                        tk.title as task_title,
                        u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
                 FROM time_entries t
                 LEFT JOIN projects p ON p.id = t.project_id
                 LEFT JOIN tasks tk ON tk.id = t.task_id
                 JOIN users u ON u.id = t.user_id
                 WHERE t.user_id = $1 AND t.end_time IS NULL`,
                [userId],
            );
            return row ? TimeEntry.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async start(userId: string, projectId?: string, taskId?: string, description?: string): Promise<TimeEntryEntity> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `INSERT INTO time_entries (user_id, project_id, task_id, start_time, description)
                 VALUES ($1, $2, $3, NOW(), $4)
                 RETURNING *`,
                [userId, projectId || null, taskId || null, description || null],
            );
            return TimeEntry.fromRow(row);
        } finally {
            client.release();
        }
    }

    async stop(id: string): Promise<TimeEntryEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `UPDATE time_entries
                 SET end_time = NOW()
                 WHERE id = $1
                 RETURNING *`,
                [id],
            );
            return row ? TimeEntry.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async createManual(data: {
        userId: string;
        projectId?: string;
        taskId?: string;
        startTime: string;
        endTime: string;
        description?: string;
    }): Promise<TimeEntryEntity> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `INSERT INTO time_entries (user_id, project_id, task_id, start_time, end_time, description, is_manual)
                 VALUES ($1, $2, $3, $4, $5, $6, true)
                 RETURNING *`,
                [data.userId, data.projectId || null, data.taskId || null, data.startTime, data.endTime, data.description || null],
            );
            return TimeEntry.fromRow(row);
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<TimeEntryEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT * FROM time_entries WHERE id = $1`,
                [id],
            );
            return row ? TimeEntry.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async findAll(
        filters: { page?: number; limit?: number; startDate?: string; endDate?: string; projectId?: string; userId?: string },
    ): Promise<{ data: TimeEntryEntity[]; total: number }> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const conditions: string[] = [];
            const params: any[] = [];
            let idx = 1;

            if (filters.userId) {
                conditions.push(`t.user_id = $${idx++}`);
                params.push(filters.userId);
            }
            if (filters.projectId) {
                conditions.push(`t.project_id = $${idx++}`);
                params.push(filters.projectId);
            }
            if (filters.startDate) {
                conditions.push(`t.start_time >= $${idx++}`);
                params.push(filters.startDate);
            }
            if (filters.endDate) {
                conditions.push(`t.end_time <= $${idx++}`);
                params.push(filters.endDate);
            }

            const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            const page = filters.page || 1;
            const limit = filters.limit || 20;

            const countResult = await BaseQuery.queryOne<{ count: string }>(
                client,
                `SELECT COUNT(*) as count FROM time_entries t ${where}`,
                params,
            );
            const total = parseInt(countResult?.count || '0', 10);

            const offset = (page - 1) * limit;
            params.push(limit, offset);
            const rows = await BaseQuery.queryMany(
                client,
                `SELECT t.*,
                        p.name as project_name,
                        tk.title as task_title,
                        u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
                 FROM time_entries t
                 LEFT JOIN projects p ON p.id = t.project_id
                 LEFT JOIN tasks tk ON tk.id = t.task_id
                 JOIN users u ON u.id = t.user_id
                 ${where}
                 ORDER BY t.start_time DESC
                 LIMIT $${idx++} OFFSET $${idx++}`,
                params,
            );

            return { data: rows.map(TimeEntry.fromRow), total };
        } finally {
            client.release();
        }
    }

    async approve(id: string): Promise<TimeEntryEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `UPDATE time_entries SET approved = true WHERE id = $1 RETURNING *`,
                [id],
            );
            return row ? TimeEntry.fromRow(row) : null;
        } finally {
            client.release();
        }
    }
}
