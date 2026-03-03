import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import {
  DepartmentEntity,
  DepartmentModel,
} from '../../domain/entities/department.entity';
import { DepartmentsSql } from '../sql/departments.sql';

@Injectable()
export class DepartmentsRepository {
  constructor(private readonly db: DatabasePool) {}

  async create(
    dept: DepartmentEntity,
    client?: PoolClient,
  ): Promise<DepartmentEntity> {
    const params = [
      dept.name,
      dept.description || null,
      dept.managerId || null,
    ];
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const row = await BaseQuery.queryOne<any>(
        dbClient,
        DepartmentsSql.CREATE,
        params,
      );
      return DepartmentModel.fromRow(row);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findAll(): Promise<DepartmentEntity[]> {
    const client = await this.db.getPool().connect();
    try {
      const rows = await BaseQuery.queryMany<any>(
        client,
        DepartmentsSql.FIND_ALL,
        [],
      );
      return rows.map((row) => DepartmentModel.fromRow(row));
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(
        client,
        DepartmentsSql.FIND_BY_ID,
        [id],
      );
      return row ? DepartmentModel.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    updates: Partial<DepartmentEntity>,
  ): Promise<DepartmentEntity | null> {
    const setClauses: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      params.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      params.push(updates.description);
    }
    if (updates.managerId !== undefined) {
      setClauses.push(`manager_id = $${paramIndex++}`);
      params.push(updates.managerId);
    }

    if (setClauses.length === 0) return this.findById(id);

    const sql =
      DepartmentsSql.UPDATE_BASE +
      setClauses.join(', ') +
      ',' +
      DepartmentsSql.UPDATE_RETURNING;
    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(client, sql, params);
      return row ? DepartmentModel.fromRow(row) : null;
    } finally {
      client.release();
    }
  }
}
