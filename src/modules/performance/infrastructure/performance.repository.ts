import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { PerformanceReviewEntity, PerformanceReviewModel } from '../domain/performance.entity';
import { PerformanceSql } from './sql/performance.sql';

@Injectable()
export class PerformanceRepository {
  constructor(private readonly db: DatabasePool) {}
  private schemaEnsured = false;

  private async ensureSchema(client: PoolClient): Promise<void> {
    if (this.schemaEnsured) return;

    await client.query(`
      CREATE TABLE IF NOT EXISTS performance_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        score NUMERIC(5,2) NOT NULL DEFAULT 0,
        bonus_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (user_id, period_start, period_end)
      );

      CREATE INDEX IF NOT EXISTS idx_performance_user_id ON performance_reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_performance_period_start ON performance_reviews(period_start);
    `);

    this.schemaEnsured = true;
  }

  async findAll(filters: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PerformanceReviewEntity[]> {
    let sql = PerformanceSql.FIND_ALL_BASE;
    const params: any[] = [];

    if (filters.userId) {
      params.push(filters.userId);
      sql += ` AND pr.user_id = $${params.length}`;
    }

    if (filters.startDate) {
      params.push(filters.startDate);
      sql += ` AND pr.period_start >= $${params.length}`;
    }

    if (filters.endDate) {
      params.push(filters.endDate);
      sql += ` AND pr.period_end <= $${params.length}`;
    }

    sql += PerformanceSql.FIND_ALL_ORDER;

    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const rows = await BaseQuery.queryMany<any>(client, sql, params);
      return rows.map((row) => PerformanceReviewModel.fromRow(row));
    } finally {
      client.release();
    }
  }

  async upsert(payload: {
    userId: string;
    periodStart: string;
    periodEnd: string;
    score: number;
    bonusAmount: number;
    notes?: string | null;
    createdBy?: string | null;
  }): Promise<PerformanceReviewEntity | null> {
    const params = [
      payload.userId,
      payload.periodStart,
      payload.periodEnd,
      payload.score,
      payload.bonusAmount,
      payload.notes ?? null,
      payload.createdBy ?? null,
    ];

    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(client, PerformanceSql.UPSERT, params);
      if (!row) return null;
      const withUser = await BaseQuery.queryOne<any>(client, `${PerformanceSql.FIND_ALL_BASE} AND pr.id = $1`, [row.id]);
      return withUser ? PerformanceReviewModel.fromRow(withUser) : null;
    } finally {
      client.release();
    }
  }
}
