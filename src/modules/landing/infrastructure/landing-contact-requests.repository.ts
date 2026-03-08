import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';

export type LandingContactRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LandingContactRequestEntity {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject: string;
  message: string;
  status: LandingContactRequestStatus;
  source: string;
  reason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  linkedClientId?: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class LandingContactRequestsRepository {
  private schemaEnsured = false;

  constructor(private readonly db: DatabasePool) {}

  private mapRow(row: any): LandingContactRequestEntity {
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone ?? null,
      company: row.company ?? null,
      subject: row.subject,
      message: row.message,
      status: row.status,
      source: row.source,
      reason: row.reason ?? null,
      reviewedBy: row.reviewed_by ?? null,
      reviewedAt: row.reviewed_at ?? null,
      linkedClientId: row.linked_client_id ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async ensureSchema(client: PoolClient): Promise<void> {
    if (this.schemaEnsured) {
      return;
    }

    await BaseQuery.execute(
      client,
      `
      CREATE TABLE IF NOT EXISTS landing_contact_requests (
        id UUID PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL,
        phone VARCHAR(32),
        company VARCHAR(120),
        subject VARCHAR(160) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        source VARCHAR(40) NOT NULL DEFAULT 'LANDING',
        reason TEXT,
        reviewed_by UUID,
        reviewed_at TIMESTAMPTZ,
        linked_client_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_landing_contact_requests_status_created_at
        ON landing_contact_requests(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_landing_contact_requests_email
        ON landing_contact_requests(email);
      `,
    );

    this.schemaEnsured = true;
  }

  async create(payload: {
    fullName: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    message: string;
    source?: string;
  }): Promise<LandingContactRequestEntity> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(
        client,
        `
        INSERT INTO landing_contact_requests (
          id, full_name, email, phone, company, subject, message, source
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        `,
        [
          uuidv4(),
          payload.fullName,
          payload.email,
          payload.phone || null,
          payload.company || null,
          payload.subject,
          payload.message,
          payload.source || 'LANDING',
        ],
      );

      return this.mapRow(row);
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<LandingContactRequestEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(
        client,
        `SELECT * FROM landing_contact_requests WHERE id = $1`,
        [id],
      );
      return row ? this.mapRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findAll(query: {
    page: number;
    limit: number;
    status?: LandingContactRequestStatus;
    search?: string;
  }): Promise<{ data: LandingContactRequestEntity[]; total: number }> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (query.status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(query.status);
      }

      if (query.search) {
        conditions.push(
          `(LOWER(full_name) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex} OR LOWER(company) LIKE $${paramIndex})`,
        );
        params.push(`%${query.search.toLowerCase()}%`);
        paramIndex += 1;
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const countRow = await BaseQuery.queryOne<{ count: string }>(
        client,
        `SELECT COUNT(*)::text as count FROM landing_contact_requests ${whereClause}`,
        params,
      );

      params.push(query.limit, (query.page - 1) * query.limit);

      const rows = await BaseQuery.queryMany<any>(
        client,
        `
        SELECT * FROM landing_contact_requests
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `,
        params,
      );

      return {
        data: rows.map((row) => this.mapRow(row)),
        total: Number(countRow?.count || 0),
      };
    } finally {
      client.release();
    }
  }

  async markApproved(
    id: string,
    reviewerId: string,
    linkedClientId: string,
  ): Promise<LandingContactRequestEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(
        client,
        `
        UPDATE landing_contact_requests
        SET status = 'APPROVED',
            reviewed_by = $2,
            reviewed_at = NOW(),
            linked_client_id = $3,
            reason = NULL,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [id, reviewerId, linkedClientId],
      );
      return row ? this.mapRow(row) : null;
    } finally {
      client.release();
    }
  }

  async markRejected(
    id: string,
    reviewerId: string,
    reason?: string,
  ): Promise<LandingContactRequestEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(
        client,
        `
        UPDATE landing_contact_requests
        SET status = 'REJECTED',
            reviewed_by = $2,
            reviewed_at = NOW(),
            reason = $3,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [id, reviewerId, reason || null],
      );
      return row ? this.mapRow(row) : null;
    } finally {
      client.release();
    }
  }
}
