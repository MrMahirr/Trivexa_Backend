import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { TimeEntry, TimeEntryEntity } from '../../domain/time-entry.entity';
import { TimeTrackingSql } from '../sql/time-tracking.sql';

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
                TimeTrackingSql.CREATE,
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
                TimeTrackingSql.FIND_BY_ID,
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
                TimeTrackingSql.FIND_ACTIVE_TIMER,
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
                TimeTrackingSql.STOP_TIMER,
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
                TimeTrackingSql.DELETE,
                [id]
            );
        } finally {
            client.release();
        }
    }
}
