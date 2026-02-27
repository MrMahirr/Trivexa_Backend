import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { TimeEntry, TimeEntryEntity } from '../../domain/time-entry.entity';

@Injectable()
export class TimeEntryRepository {
    constructor(private readonly dbPool: DatabasePool) { }

    async create(data: {
        userId: string;
        projectId?: string;
        taskId?: string;
        description?: string;
        isManual?: boolean;
        startTime?: Date;
    }): Promise<TimeEntryEntity> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `INSERT INTO time_entries (user_id, project_id, task_id, description, is_manual, start_time)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
         RETURNING *`,
                [
                    data.userId,
                    data.projectId || null,
                    data.taskId || null,
                    data.description || null,
                    data.isManual || false,
                    data.startTime || null
                ]
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
                [id]
            );
            return row ? TimeEntry.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async findActiveTimer(userId: string): Promise<TimeEntryEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT * FROM time_entries WHERE user_id = $1 AND end_time IS NULL ORDER BY start_time DESC LIMIT 1`,
                [userId]
            );
            return row ? TimeEntry.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async stopTimer(
        id: string,
        endTime: Date,
        durationMinutes: number,
        description?: string
    ): Promise<TimeEntryEntity> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `UPDATE time_entries 
         SET end_time = $1, duration_minutes = $2, description = COALESCE($3, description), updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
                [endTime, durationMinutes, description || null, id]
            );
            return TimeEntry.fromRow(row);
        } finally {
            client.release();
        }
    }

    async delete(id: string): Promise<void> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            await BaseQuery.queryOne(
                client,
                `DELETE FROM time_entries WHERE id = $1`,
                [id]
            );
        } finally {
            client.release();
        }
    }
}
