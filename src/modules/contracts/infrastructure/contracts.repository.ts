import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import {
  Contract,
  ContractEntity,
  ContractStatus,
} from '../domain/contract.entity';

@Injectable()
export class ContractsRepository {
  constructor(private readonly db: DatabasePool) { }

  async create(
    contract: ContractEntity,
    client?: PoolClient,
  ): Promise<ContractEntity> {
    const sql = `
            INSERT INTO contracts (
                client_id, title, description, status, start_date, end_date, value, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
    const params = [
      contract.clientId,
      contract.title,
      contract.description,
      contract.status,
      contract.startDate,
      contract.endDate,
      contract.value,
      contract.createdBy,
    ];
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const row = await BaseQuery.queryOne<any>(dbClient, sql, params);
      return Contract.fromRow(row);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findById(id: string): Promise<ContractEntity | null> {
    const sql = `SELECT * FROM contracts WHERE id = $1`;
    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(client, sql, [id]);
      return row ? Contract.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findAll(filters: {
    clientId?: string;
    status?: ContractStatus;
  }): Promise<ContractEntity[]> {
    let sql = `SELECT * FROM contracts WHERE 1=1`;
    const params: any[] = [];

    if (filters.clientId) {
      params.push(filters.clientId);
      sql += ` AND client_id = $${params.length}`;
    }
    if (filters.status) {
      params.push(filters.status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC`;

    const client = await this.db.getPool().connect();
    try {
      const rows = await BaseQuery.queryMany<any>(client, sql, params);
      return rows.map((row) => Contract.fromRow(row));
    } finally {
      client.release();
    }
  }

  async updateStatus(
    id: string,
    status: ContractStatus,
    signedUrl?: string,
  ): Promise<ContractEntity | null> {
    let sql = `UPDATE contracts SET status = $2`;
    const params: any[] = [id, status];

    if (signedUrl) {
      params.push(signedUrl);
      sql += `, signed_url = $${params.length}`;
    }

    sql += `, updated_at = NOW() WHERE id = $1 RETURNING *`;

    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(client, sql, params);
      return row ? Contract.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findExpiringContracts(days: number): Promise<ContractEntity[]> {
    const sql = `
      SELECT * FROM contracts 
      WHERE status IN ('APPROVED', 'SIGNED', 'ACTIVE') 
        AND end_date IS NOT NULL 
        AND end_date BETWEEN NOW() AND NOW() + $1::INTERVAL
      ORDER BY end_date ASC
    `;
    const intervalStr = `${days} days`;
    const client = await this.db.getPool().connect();
    try {
      const rows = await BaseQuery.queryMany<any>(client, sql, [intervalStr]);
      return rows.map((row) => Contract.fromRow(row));
    } finally {
      client.release();
    }
  }
}
