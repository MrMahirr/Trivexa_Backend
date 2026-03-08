import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';

export interface ClientPortalRequestEntity {
  id: string;
  client_id: string;
  client_user_id: string;
  subject: string;
  description: string;
  priority: string;
  type: string;
  status: string;
  created_at: Date;
  updated_at: Date;
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
      CREATE INDEX IF NOT EXISTS idx_client_portal_requests_created_at
      ON client_portal_requests(created_at DESC);
      `,
    );

    this.schemaEnsured = true;
  }

  async create(data: {
    clientId: string;
    clientUserId: string;
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
          subject,
          description,
          priority,
          type
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
        [
          data.clientId,
          data.clientUserId,
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
        SELECT *
        FROM client_portal_requests
        WHERE client_id = $1
        ORDER BY created_at DESC;
        `,
        [clientId],
      );
    } finally {
      client.release();
    }
  }
}
