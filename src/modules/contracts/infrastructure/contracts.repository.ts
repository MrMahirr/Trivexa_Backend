import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import {
  Contract,
  ContractEntity,
  ContractStatus,
} from '../domain/contract.entity';
import { ContractsSql } from './sql/contracts.sql';

@Injectable()
export class ContractsRepository {
  constructor(private readonly db: DatabasePool) {}

  async create(
    contract: ContractEntity,
    client?: PoolClient,
  ): Promise<ContractEntity> {
    const sql = ContractsSql.CREATE;
    const params = [
      contract.clientId,
      contract.projectId ?? null,
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
    const sql = ContractsSql.FIND_BY_ID;
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
    let sql = ContractsSql.FIND_ALL_BASE;
    const params: any[] = [];

    if (filters.clientId) {
      params.push(filters.clientId);
      sql += ` AND client_id = $${params.length}`;
    }
    if (filters.status) {
      params.push(filters.status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ContractsSql.FIND_ALL_ORDER;

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
    let sql = ContractsSql.UPDATE_STATUS_BASE;
    const params: any[] = [id, status];

    if (signedUrl) {
      params.push(signedUrl);
      sql += ContractsSql.UPDATE_SIGNED_URL;
    }

    sql += ContractsSql.UPDATE_RETURNING;

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
