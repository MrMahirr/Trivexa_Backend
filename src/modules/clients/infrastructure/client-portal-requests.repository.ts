import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';

export interface ClientPortalRequestEntity {
  id: string;
  client_id: string;
  client_user_id: string;
  project_id?: string | null;
  subject: string;
  description: string;
  priority: string;
  type: string;
  status: string;
  project_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ClientPortalRequestListItem extends ClientPortalRequestEntity {
  client_company_name: string;
  requester_email: string;
  project_name?: string;
}

@Injectable()
export class ClientPortalRequestsRepository {
  private schemaEnsured = false;

  constructor(private readonly dbPool: DatabasePool) {}

  private async ensureSchema(client: PoolClient): Promise<void> {
    if (this.schemaEnsured) {
      return;
    }

    await BaseQuery.execute(
      client,
      `
      CREATE TABLE IF NOT EXISTS client_portal_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        client_user_id UUID NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        type TEXT NOT NULL DEFAULT 'SUPPORT',
        status TEXT NOT NULL DEFAULT 'OPEN',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      `,
    );

    await BaseQuery.execute(
      client,
      `
      ALTER TABLE client_portal_requests
      ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
      `,
    );

    await BaseQuery.execute(
      client,
      `
      CREATE INDEX IF NOT EXISTS idx_client_portal_requests_client_id
      ON client_portal_requests(client_id);
      `,
    );

    await BaseQuery.execute(
      client,
      `
      CREATE INDEX IF NOT EXISTS idx_client_portal_requests_client_user_id
      ON client_portal_requests(client_user_id);
      `,
    );

    await BaseQuery.execute(
      client,
      `
      CREATE INDEX IF NOT EXISTS idx_client_portal_requests_project_id
      ON client_portal_requests(project_id);
      `,
    );

    await BaseQuery.execute(
      client,
      `
      CREATE INDEX IF NOT EXISTS idx_client_portal_requests_created_at
      ON client_portal_requests(created_at DESC);
      `,
    );

    this.schemaEnsured = true;
  }

  async create(data: {
    clientId: string;
    clientUserId: string;
    projectId?: string;
    subject: string;
    description: string;
    priority?: string;
    type?: string;
  }): Promise<ClientPortalRequestEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<ClientPortalRequestEntity>(
        client,
        `
        INSERT INTO client_portal_requests (
          client_id,
          client_user_id,
          project_id,
          subject,
          description,
          priority,
          type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        `,
        [
          data.clientId,
          data.clientUserId,
          data.projectId || null,
          data.subject,
          data.description,
          data.priority || 'MEDIUM',
          data.type || 'SUPPORT',
        ],
      );

      return row as ClientPortalRequestEntity;
    } finally {
      client.release();
    }
  }

  async findAllByClient(clientId: string): Promise<ClientPortalRequestEntity[]> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      return BaseQuery.queryMany<ClientPortalRequestEntity>(
        client,
        `
        SELECT
          r.*,
          COALESCE(p.name, '') AS project_name
        FROM client_portal_requests r
        LEFT JOIN projects p ON p.id = r.project_id
        WHERE r.client_id = $1
        ORDER BY r.created_at DESC;
        `,
        [clientId],
      );
    } finally {
      client.release();
    }
  }

  async findAllForAdmin(query: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    priority?: string;
    type?: string;
    clientId?: string;
  }): Promise<{ data: ClientPortalRequestListItem[]; total: number }> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);

      const conditions: string[] = [];
      const params: Array<string | number> = [];
      let paramIndex = 1;

      if (query.clientId) {
        conditions.push(`r.client_id = $${paramIndex++}`);
        params.push(query.clientId);
      }
      if (query.status) {
        conditions.push(`UPPER(r.status) = $${paramIndex++}`);
        params.push(query.status.toUpperCase());
      }
      if (query.priority) {
        conditions.push(`UPPER(r.priority) = $${paramIndex++}`);
        params.push(query.priority.toUpperCase());
      }
      if (query.type) {
        conditions.push(`UPPER(r.type) = $${paramIndex++}`);
        params.push(query.type.toUpperCase());
      }
      if (query.search) {
        conditions.push(
          `(
            LOWER(r.subject) LIKE $${paramIndex}
            OR LOWER(r.description) LIKE $${paramIndex}
            OR LOWER(c.company_name) LIKE $${paramIndex}
            OR LOWER(cu.email) LIKE $${paramIndex}
            OR LOWER(p.name) LIKE $${paramIndex}
          )`,
        );
        params.push(`%${query.search.toLowerCase()}%`);
        paramIndex++;
      }

      const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

      const countRow = await BaseQuery.queryOne<{ count: string }>(
        client,
        `
        SELECT COUNT(*)::text as count
        FROM client_portal_requests r
        LEFT JOIN clients c ON c.id = r.client_id
        LEFT JOIN client_users cu ON cu.id = r.client_user_id
        LEFT JOIN projects p ON p.id = r.project_id
        ${whereClause};
        `,
        params,
      );
      const total = Number.parseInt(countRow?.count || '0', 10);

      const offset = (query.page - 1) * query.limit;
      params.push(query.limit, offset);

      const rows = await BaseQuery.queryMany<ClientPortalRequestListItem>(
        client,
        `
        SELECT
          r.*,
          COALESCE(c.company_name, '') AS client_company_name,
          COALESCE(cu.email, '') AS requester_email,
          COALESCE(p.name, '') AS project_name
        FROM client_portal_requests r
        LEFT JOIN clients c ON c.id = r.client_id
        LEFT JOIN client_users cu ON cu.id = r.client_user_id
        LEFT JOIN projects p ON p.id = r.project_id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT $${paramIndex++}
        OFFSET $${paramIndex++};
        `,
        params,
      );

      return {
        data: rows,
        total,
      };
    } finally {
      client.release();
    }
  }
}
