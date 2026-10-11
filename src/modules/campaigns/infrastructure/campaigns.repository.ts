import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import {
  Campaign,
  CampaignEntity,
  CampaignObjective,
  CampaignPlatform,
  CampaignStatus,
} from '../domain/campaign.entity';
import { CampaignsSql } from './sql/campaigns.sql';

@Injectable()
export class CampaignsRepository {
  constructor(private readonly db: DatabasePool) {}

  async create(
    campaign: CampaignEntity,
    client?: PoolClient,
  ): Promise<CampaignEntity> {
    const sql = CampaignsSql.CREATE;
    const params = [
      campaign.projectId ?? null,
      campaign.title,
      campaign.description ?? null,
      campaign.platform,
      campaign.objective,
      campaign.status,
      campaign.startDate,
      campaign.endDate,
      campaign.budget,
      campaign.owner ?? null,
      campaign.createdBy ?? null,
    ];

    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const row = await BaseQuery.queryOne<any>(dbClient, sql, params);
      return Campaign.fromRow(row);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findById(id: string): Promise<CampaignEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(
        client,
        CampaignsSql.FIND_BY_ID,
        [id],
      );
      return row ? Campaign.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findAll(filters: {
    projectId?: string;
    status?: CampaignStatus;
    platform?: CampaignPlatform;
    objective?: CampaignObjective;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CampaignEntity[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filters.projectId) {
      conditions.push(`c.project_id = $${idx++}`);
      params.push(filters.projectId);
    }
    if (filters.status) {
      conditions.push(`c.status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.platform) {
      conditions.push(`c.platform = $${idx++}`);
      params.push(filters.platform);
    }
    if (filters.objective) {
      conditions.push(`c.objective = $${idx++}`);
      params.push(filters.objective);
    }
    if (filters.search) {
      conditions.push(`(
        LOWER(c.title) LIKE $${idx}
        OR LOWER(c.description) LIKE $${idx}
        OR LOWER(p.name) LIKE $${idx}
      )`);
      params.push(`%${filters.search.toLowerCase()}%`);
      idx++;
    }

    const where = conditions.length ? ` AND ${conditions.join(' AND ')}` : '';
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 200);
    const offset = (page - 1) * limit;

    const client = await this.db.getPool().connect();
    try {
      const countRow = await BaseQuery.queryOne<{ count: number }>(
        client,
        `${CampaignsSql.FIND_ALL_COUNT} ${where}`,
        params,
      );
      const total = Number(countRow?.count ?? 0);

      const rows = await BaseQuery.queryMany<any>(
        client,
        `${CampaignsSql.FIND_ALL_BASE} ${where} ORDER BY c.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset],
      );

      return { data: rows.map((row) => Campaign.fromRow(row)), total };
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: Partial<{
      projectId: string | null;
      title: string;
      description: string | null;
      platform: CampaignPlatform;
      objective: CampaignObjective;
      status: CampaignStatus;
      startDate: string;
      endDate: string;
      budget: number;
      owner: string | null;
    }>,
  ): Promise<CampaignEntity | null> {
    const setClauses: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    const fieldMap: Record<string, string> = {
      projectId: 'project_id',
      title: 'title',
      description: 'description',
      platform: 'platform',
      objective: 'objective',
      status: 'status',
      startDate: 'start_date',
      endDate: 'end_date',
      budget: 'budget',
      owner: 'owner',
    };

    const dataRecord = data as Record<string, unknown>;
    for (const [key, column] of Object.entries(fieldMap)) {
      if (dataRecord[key] !== undefined) {
        setClauses.push(`${column} = $${paramIndex++}`);
        params.push(dataRecord[key]);
      }
    }

    if (setClauses.length === 0) return this.findById(id);

    const sql = `
      UPDATE campaigns
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(client, sql, params);
      return row ? Campaign.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async updateStatus(
    id: string,
    status: CampaignStatus,
  ): Promise<CampaignEntity | null> {
    const sql = `
      UPDATE campaigns
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(client, sql, [id, status]);
      return row ? Campaign.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async remove(id: string): Promise<void> {
    const client = await this.db.getPool().connect();
    try {
      await BaseQuery.execute(client, 'DELETE FROM campaigns WHERE id = $1', [
        id,
      ]);
    } finally {
      client.release();
    }
  }
}
