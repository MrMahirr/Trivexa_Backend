import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { Meeting, MeetingEntity } from '../domain/meeting.entity';
import { MeetingsSql } from './sql/meetings.sql';

export interface MeetingAccessContext {
  userId: string;
  role: string;
  department?: string | null;
  canViewAll: boolean;
  isManager: boolean;
}

@Injectable()
export class MeetingsRepository {
  constructor(private readonly db: DatabasePool) {}
  private schemaEnsured = false;

  private async ensureSchema(client: PoolClient): Promise<void> {
    if (this.schemaEnsured) return;

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'meetings'
        ) THEN
          ALTER TABLE meetings
            ADD COLUMN IF NOT EXISTS summary TEXT,
            ADD COLUMN IF NOT EXISTS audience_type TEXT NOT NULL DEFAULT 'PERSONAL',
            ADD COLUMN IF NOT EXISTS department TEXT;

          CREATE INDEX IF NOT EXISTS idx_meetings_audience_type ON meetings(audience_type);
          CREATE INDEX IF NOT EXISTS idx_meetings_department ON meetings(department);
          CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings(project_id);
          CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
        END IF;
      END
      $$;
    `);

    this.schemaEnsured = true;
  }

  private applyAccessPredicate(
    baseSql: string,
    params: any[],
    access?: MeetingAccessContext,
  ): string {
    if (!access || access.canViewAll) return baseSql;

    const userIdParam = params.push(access.userId);
    const roleParam = params.push(String(access.role ?? '').toUpperCase());
    const departmentParam = params.push(access.department ?? '');
    const isManagerParam = params.push(Boolean(access.isManager));

    return `${baseSql}
      AND (
        m.organizer_id = $${userIdParam}
        OR (
          m.audience_type = 'PROJECT'
          AND m.project_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM project_members pm
            WHERE pm.project_id = m.project_id
              AND pm.user_id = $${userIdParam}
          )
        )
        OR (
          m.audience_type = 'DEPARTMENT'
          AND COALESCE($${departmentParam}, '') <> ''
          AND UPPER(m.department) = UPPER($${departmentParam})
        )
        OR (
          m.audience_type = 'ALL_PERSONNEL'
          AND $${roleParam} <> 'CLIENT'
        )
        OR (
          m.audience_type = 'MANAGERS'
          AND $${isManagerParam} = TRUE
        )
      )
    `;
  }

  async create(
    meeting: MeetingEntity,
    client?: PoolClient,
  ): Promise<MeetingEntity> {
    const sql = MeetingsSql.CREATE;
    const params = [
      meeting.clientId,
      meeting.projectId,
      meeting.audienceType,
      meeting.department,
      meeting.title,
      meeting.date,
      meeting.durationMinutes,
      meeting.link,
      meeting.notes,
      meeting.summary,
      meeting.organizerId,
    ];

    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      await this.ensureSchema(dbClient);
      const row = await BaseQuery.queryOne<any>(dbClient, sql, params);
      return Meeting.fromRow(row);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findAll(
    filters: {
      clientId?: string;
      projectId?: string;
    },
    access?: MeetingAccessContext,
  ): Promise<MeetingEntity[]> {
    let sql = MeetingsSql.FIND_ALL_BASE;
    const params: any[] = [];

    if (filters.clientId) {
      params.push(filters.clientId);
      sql += ` AND m.client_id = $${params.length}`;
    }
    if (filters.projectId) {
      params.push(filters.projectId);
      sql += ` AND m.project_id = $${params.length}`;
    }

    sql = this.applyAccessPredicate(sql, params, access);
    sql += MeetingsSql.FIND_ALL_ORDER;

    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const rows = await BaseQuery.queryMany<any>(client, sql, params);
      return rows.map((row) => Meeting.fromRow(row));
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<MeetingEntity | null> {
    const sql = MeetingsSql.FIND_BY_ID;
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(client, sql, [id]);
      return row ? Meeting.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findByIdForUser(
    id: string,
    access: MeetingAccessContext,
  ): Promise<MeetingEntity | null> {
    let sql = `SELECT * FROM meetings m WHERE m.id = $1`;
    const params: any[] = [id];
    sql = this.applyAccessPredicate(sql, params, access);

    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(client, sql, params);
      return row ? Meeting.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      date: string;
      durationMinutes: number;
      clientId: string;
      projectId: string | null;
      audienceType: string;
      department: string | null;
      link: string;
      notes: string;
      summary: string;
    }>,
  ): Promise<MeetingEntity | null> {
    const setClauses: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    const fieldMap: Record<string, string> = {
      title: 'title',
      date: 'date',
      durationMinutes: 'duration_minutes',
      clientId: 'client_id',
      projectId: 'project_id',
      audienceType: 'audience_type',
      department: 'department',
      link: 'link',
      notes: 'notes',
      summary: 'summary',
    };

    const dataRecord = data as Record<string, unknown>;
    for (const [key, column] of Object.entries(fieldMap)) {
      if (dataRecord[key] !== undefined) {
        setClauses.push(`${column} = $${paramIndex++}`);
        params.push(dataRecord[key]);
      }
    }

    if (setClauses.length === 0) return this.findById(id);

    const sql = `UPDATE meetings SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(client, sql, params);
      return row ? Meeting.fromRow(row) : null;
    } finally {
      client.release();
    }
  }
}
