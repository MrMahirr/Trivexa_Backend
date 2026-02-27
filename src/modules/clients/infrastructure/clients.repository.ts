import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { Client, ClientEntity } from '../domain/client.entity';
import { ClientsSql } from './sql/clients.sql';

@Injectable()
export class ClientsRepository {
  constructor(private readonly dbPool: DatabasePool) { }

  async findAll(query: {
    page: number;
    limit: number;
    search?: string;
    isActive?: string;
  }): Promise<{ data: ClientEntity[]; total: number }> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (query.isActive !== undefined) {
        conditions.push(`is_active = $${paramIndex++}`);
        params.push(query.isActive === 'true');
      }
      if (query.search) {
        conditions.push(
          `(LOWER(company_name) LIKE $${paramIndex} OR LOWER(contact_person) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex})`,
        );
        params.push(`%${query.search.toLowerCase()}%`);
        paramIndex++;
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

      const countResult = await BaseQuery.queryOne<{ count: string }>(
        client,
        `SELECT COUNT(*) as count FROM clients ${whereClause}`,
        params,
      );
      const total = parseInt(countResult?.count || '0', 10);

      const offset = (query.page - 1) * query.limit;
      params.push(query.limit, offset);
      const rows = await BaseQuery.queryMany(
        client,
        `SELECT id, company_name, contact_person, email, phone, address, is_active, created_at, updated_at
                 FROM clients ${whereClause}
                 ORDER BY created_at DESC
                 LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        params,
      );

      return {
        data: rows.map((row) => Client.fromRow(row)),
        total,
      };
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<ClientEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(
        client,
        ClientsSql.FIND_BY_ID,
        [id],
      );
      return row ? Client.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(
        client,
        ClientsSql.FIND_BY_EMAIL,
        [email],
      );
      return row ? Client.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findByCompanyName(name: string): Promise<ClientEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(
        client,
        ClientsSql.FIND_BY_COMPANY_NAME,
        [name],
      );
      return row ? Client.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async create(data: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone?: string;
    address?: string;
  }): Promise<ClientEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(
        client,
        ClientsSql.CREATE,
        [
          data.companyName,
          data.contactPerson,
          data.email,
          data.phone || null,
          data.address || null,
        ],
      );
      return Client.fromRow(row);
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: Partial<{
      companyName: string;
      contactPerson: string;
      email: string;
      phone: string;
      address: string;
    }>,
  ): Promise<ClientEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (data.companyName !== undefined) {
        setClauses.push(`company_name = $${paramIndex++}`);
        params.push(data.companyName);
      }
      if (data.contactPerson !== undefined) {
        setClauses.push(`contact_person = $${paramIndex++}`);
        params.push(data.contactPerson);
      }
      if (data.email !== undefined) {
        setClauses.push(`email = $${paramIndex++}`);
        params.push(data.email);
      }
      if (data.phone !== undefined) {
        setClauses.push(`phone = $${paramIndex++}`);
        params.push(data.phone);
      }
      if (data.address !== undefined) {
        setClauses.push(`address = $${paramIndex++}`);
        params.push(data.address);
      }

      if (setClauses.length === 0) return this.findById(id);

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const row = await BaseQuery.queryOne(
        client,
        `UPDATE clients SET ${setClauses.join(', ')}
                 WHERE id = $${paramIndex}
                 RETURNING id, company_name, contact_person, email, phone, address, is_active, created_at, updated_at`,
        params,
      );
      return row ? Client.fromRow(row) : null;
    } finally {
      client.release();
    }
  }
}
