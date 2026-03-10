import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { randomUUID } from 'crypto';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { LeaveRequestEntity, LeaveRequestModel } from '../domain/leave-request.entity';
import { LeaveRequestsSql } from './sql/leave-requests.sql';
import { LeaveStatus, LeaveType } from '../domain/leave.enums';

@Injectable()
export class LeaveRequestsRepository {
  constructor(private readonly db: DatabasePool) {}
  private schemaEnsured = false;

  private async ensureSchema(client: PoolClient): Promise<void> {
    if (this.schemaEnsured) return;

    await client.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        department TEXT,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        duration_days INTEGER NOT NULL DEFAULT 1,
        reason TEXT,
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
      CREATE INDEX IF NOT EXISTS idx_leave_requests_start_date ON leave_requests(start_date);
    `);

    this.schemaEnsured = true;
  }

  async findAll(filters: {
    status?: LeaveStatus;
    type?: LeaveType;
    department?: string;
    search?: string;
  }): Promise<LeaveRequestEntity[]> {
    let sql = LeaveRequestsSql.FIND_ALL_BASE;
    const params: any[] = [];

    if (filters.status) {
      params.push(filters.status);
      sql += ` AND lr.status = $${params.length}`;
    }
    if (filters.type) {
      params.push(filters.type);
      sql += ` AND lr.type = $${params.length}`;
    }
    if (filters.department) {
      params.push(filters.department);
      sql += ` AND COALESCE(lr.department, u.department) = $${params.length}`;
    }
    if (filters.search) {
      params.push(`%${filters.search}%`);
      sql += ` AND (u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    sql += LeaveRequestsSql.FIND_ALL_ORDER;

    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const rows = await BaseQuery.queryMany<any>(client, sql, params);
      return rows.map((row) => LeaveRequestModel.fromRow(row));
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<LeaveRequestEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(client, LeaveRequestsSql.FIND_BY_ID, [id]);
      return row ? LeaveRequestModel.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async create(payload: {
    userId: string;
    department?: string | null;
    type: LeaveType;
    status?: LeaveStatus;
    startDate: string;
    endDate: string;
    durationDays: number;
    reason?: string | null;
  }): Promise<LeaveRequestEntity | null> {
    const params = [
      randomUUID(),
      payload.userId,
      payload.department ?? null,
      payload.type,
      payload.status ?? LeaveStatus.PENDING,
      payload.startDate,
      payload.endDate,
      payload.durationDays,
      payload.reason ?? null,
    ];

    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(client, LeaveRequestsSql.CREATE, params);
      if (!row) return null;
      const withUser = await BaseQuery.queryOne<any>(client, LeaveRequestsSql.FIND_BY_ID, [row.id]);
      return withUser ? LeaveRequestModel.fromRow(withUser) : null;
    } finally {
      client.release();
    }
  }

  async updateStatus(payload: {
    id: string;
    status: LeaveStatus;
    approvedBy?: string | null;
    approvedAt?: Date | null;
  }): Promise<LeaveRequestEntity | null> {
    const params = [
      payload.id,
      payload.status,
      payload.approvedBy ?? null,
      payload.approvedAt ?? null,
    ];

    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(client, LeaveRequestsSql.UPDATE_STATUS, params);
      if (!row) return null;
      const withUser = await BaseQuery.queryOne<any>(client, LeaveRequestsSql.FIND_BY_ID, [row.id]);
      return withUser ? LeaveRequestModel.fromRow(withUser) : null;
    } finally {
      client.release();
    }
  }
}
