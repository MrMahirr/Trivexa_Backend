import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { Meeting, MeetingEntity } from '../domain/meeting.entity';
import { MeetingsSql } from './sql/meetings.sql';

@Injectable()
export class MeetingsRepository {
  constructor(private readonly db: DatabasePool) { }

  async create(
    meeting: MeetingEntity,
    client?: PoolClient,
  ): Promise<MeetingEntity> {
    const sql = MeetingsSql.CREATE;
    const params = [
      meeting.clientId,
      meeting.projectId,
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
      const row = await BaseQuery.queryOne<any>(dbClient, sql, params);
      return Meeting.fromRow(row);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findAll(filters: {
    clientId?: string;
    projectId?: string;
    organizerId?: string;
  }): Promise<MeetingEntity[]> {
    let sql = MeetingsSql.FIND_ALL_BASE;
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

    sql += MeetingsSql.FIND_ALL_ORDER;

    const client = await this.db.getPool().connect();
    try {
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
      const row = await BaseQuery.queryOne<any>(client, sql, [id]);
      return row ? Meeting.fromRow(row) : null;
    } finally {
      client.release();
    }
  }
}
