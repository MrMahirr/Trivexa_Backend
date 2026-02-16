import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { Meeting, MeetingEntity } from '../domain/meeting.entity';

@Injectable()
export class MeetingsRepository {
    constructor(private readonly db: DatabasePool) { }

    async create(meeting: MeetingEntity, client?: PoolClient): Promise<MeetingEntity> {
        const sql = `
            INSERT INTO meetings (
                client_id, project_id, title, date, duration_minutes, link, notes, organizer_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const params = [
            meeting.clientId,
            meeting.projectId,
            meeting.title,
            meeting.date,
            meeting.durationMinutes,
            meeting.link,
            meeting.notes,
            meeting.organizerId,
        ];

        const dbClient = client || await this.db.getPool().connect();
        const shouldRelease = !client;
        try {
            const row = await BaseQuery.queryOne<any>(dbClient, sql, params);
            return Meeting.fromRow(row);
        } finally {
            if (shouldRelease) (dbClient as PoolClient).release();
        }
    }

    async findAll(filters: { clientId?: string; projectId?: string; organizerId?: string }): Promise<MeetingEntity[]> {
        let sql = `SELECT * FROM meetings WHERE 1=1`;
        const params: any[] = [];

        if (filters.clientId) {
            params.push(filters.clientId);
            sql += ` AND client_id = $${params.length}`;
        }
        if (filters.projectId) {
            params.push(filters.projectId);
            sql += ` AND project_id = $${params.length}`;
        }
        if (filters.organizerId) {
            params.push(filters.organizerId);
            sql += ` AND organizer_id = $${params.length}`;
        }

        sql += ` ORDER BY date DESC`;

        const client = await this.db.getPool().connect();
        try {
            const rows = await BaseQuery.queryMany<any>(client, sql, params);
            return rows.map(row => Meeting.fromRow(row));
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<MeetingEntity | null> {
        const sql = `SELECT * FROM meetings WHERE id = $1`;
        const client = await this.db.getPool().connect();
        try {
            const row = await BaseQuery.queryOne<any>(client, sql, [id]);
            return row ? Meeting.fromRow(row) : null;
        } finally {
            client.release();
        }
    }
}
