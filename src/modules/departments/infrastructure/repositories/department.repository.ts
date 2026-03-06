import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { randomUUID } from 'crypto';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import {
  DepartmentEntity,
  DepartmentModel,
  DepartmentModuleEntity,
  DepartmentModuleModel,
} from '../../domain/entities/department.entity';
import { DepartmentsSql } from '../sql/departments.sql';

const DEFAULT_DEPARTMENTS: Array<{ name: string; description: string }> = [
  { name: 'MANAGEMENT', description: 'Company management and leadership operations.' },
  { name: 'DESIGN', description: 'Design and creative production operations.' },
  { name: 'DEVELOPMENT', description: 'Software engineering and technical operations.' },
  { name: 'MARKETING', description: 'Marketing, campaign and growth operations.' },
  { name: 'FINANCE', description: 'Finance, billing and reporting operations.' },
  { name: 'HR', description: 'Human resources and personnel operations.' },
];

const DEFAULT_DEPARTMENT_MODULES: Record<string, Array<{ name: string; description: string }>> = {
  DEVELOPMENT: [
    { name: 'BACKEND_DEVELOPER', description: 'Backend API and data model development.' },
    { name: 'FRONTEND_DEVELOPER', description: 'Frontend web and UI development.' },
    { name: 'UI_UX', description: 'User interface and user experience design.' },
  ],
  DESIGN: [
    { name: 'GRAPHIC_DESIGN', description: 'Brand and campaign visual design.' },
    { name: 'MOTION_DESIGN', description: 'Motion graphics and animation tasks.' },
  ],
  MARKETING: [
    { name: 'DIGITAL_MARKETING', description: 'Digital channels and performance campaigns.' },
    { name: 'SOCIAL_MEDIA', description: 'Social media planning and publishing.' },
  ],
};

@Injectable()
export class DepartmentsRepository {
  constructor(private readonly db: DatabasePool) {}
  private schemaEnsured = false;

  private async ensureSchema(client: PoolClient): Promise<void> {
    if (this.schemaEnsured) return;

    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        manager_id UUID,
        is_system BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
      ALTER TABLE departments
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS manager_id UUID,
      ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
    `);

    for (const department of DEFAULT_DEPARTMENTS) {
      await client.query(
        `
          INSERT INTO departments (id, name, description, is_system)
          VALUES ($1, $2, $3, true)
          ON CONFLICT (name) DO UPDATE
          SET is_system = true
        `,
        [randomUUID(), department.name, department.description],
      );
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS department_modules (
        id UUID PRIMARY KEY,
        department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        team_lead_id UUID,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(department_id, name)
      );
    `);

    await client.query(`
      ALTER TABLE department_modules
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS team_lead_id UUID,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
    `);

    const departmentRows = await BaseQuery.queryMany<{ id: string; name: string }>(
      client,
      `SELECT id, name FROM departments`,
      [],
    );

    const defaultLeader = await BaseQuery.queryOne<{ id: string }>(
      client,
      `
        SELECT id
        FROM users
        WHERE role IN ('ADMIN', 'CEO', 'MANAGER')
        ORDER BY created_at ASC
        LIMIT 1
      `,
      [],
    );

    const departmentIdByName = new Map<string, string>();
    for (const row of departmentRows) {
      departmentIdByName.set(row.name, row.id);
    }

    for (const [departmentName, modules] of Object.entries(DEFAULT_DEPARTMENT_MODULES)) {
      const departmentId = departmentIdByName.get(departmentName);
      if (!departmentId) continue;

      for (const module of modules) {
        await client.query(
          `
            INSERT INTO department_modules (id, department_id, name, description, team_lead_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (department_id, name) DO NOTHING
          `,
          [
            randomUUID(),
            departmentId,
            module.name,
            module.description,
            defaultLeader?.id ?? null,
          ],
        );
      }
    }

    this.schemaEnsured = true;
  }

  private async findModulesByDepartmentIds(
    client: PoolClient,
    departmentIds: string[],
  ): Promise<DepartmentModuleEntity[]> {
    if (!departmentIds.length) return [];

    const rows = await BaseQuery.queryMany<any>(
      client,
      DepartmentsSql.FIND_MODULES_BY_DEPARTMENT_IDS,
      [departmentIds],
    );

    return rows.map((row) => DepartmentModuleModel.fromRow(row));
  }

  private mapDepartmentsWithModules(
    departments: DepartmentEntity[],
    modules: DepartmentModuleEntity[],
  ): DepartmentEntity[] {
    const modulesByDepartmentId = new Map<string, DepartmentModuleEntity[]>();

    for (const module of modules) {
      const bucket = modulesByDepartmentId.get(module.departmentId) ?? [];
      bucket.push(module);
      modulesByDepartmentId.set(module.departmentId, bucket);
    }

    return departments.map((department) => ({
      ...department,
      modules: modulesByDepartmentId.get(department.id) ?? [],
    }));
  }

  async create(
    dept: DepartmentEntity,
    client?: PoolClient,
  ): Promise<DepartmentEntity> {
    const params = [
      dept.id,
      dept.name,
      dept.description || null,
      dept.managerId || null,
    ];
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      await this.ensureSchema(dbClient);
      const row = await BaseQuery.queryOne<any>(
        dbClient,
        DepartmentsSql.CREATE,
        params,
      );
      const created = DepartmentModel.fromRow(row);
      return { ...created, modules: [] };
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findAll(): Promise<DepartmentEntity[]> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const rows = await BaseQuery.queryMany<any>(
        client,
        DepartmentsSql.FIND_ALL,
        [],
      );
      const departments = rows.map((row) => DepartmentModel.fromRow(row));
      const modules = await this.findModulesByDepartmentIds(
        client,
        departments.map((department) => department.id),
      );
      return this.mapDepartmentsWithModules(departments, modules);
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(
        client,
        DepartmentsSql.FIND_BY_ID,
        [id],
      );

      if (!row) {
        return null;
      }

      const department = DepartmentModel.fromRow(row);
      const modules = await this.findModulesByDepartmentIds(client, [id]);
      return {
        ...department,
        modules,
      };
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
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(client, sql, params);
      if (!row) {
        return null;
      }

      const department = DepartmentModel.fromRow(row);
      const modules = await this.findModulesByDepartmentIds(client, [id]);
      return {
        ...department,
        modules,
      };
    } finally {
      client.release();
    }
  }

  async createModule(payload: {
    departmentId: string;
    name: string;
    description?: string;
    teamLeadId: string;
  }): Promise<DepartmentModuleEntity> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(
        client,
        DepartmentsSql.CREATE_MODULE,
        [
          randomUUID(),
          payload.departmentId,
          payload.name,
          payload.description || null,
          payload.teamLeadId,
        ],
      );

      return DepartmentModuleModel.fromRow(row);
    } finally {
      client.release();
    }
  }

  async findModuleById(moduleId: string): Promise<DepartmentModuleEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(
        client,
        DepartmentsSql.FIND_MODULE_BY_ID,
        [moduleId],
      );
      return row ? DepartmentModuleModel.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async updateModule(
    moduleId: string,
    updates: Partial<DepartmentModuleEntity>,
  ): Promise<DepartmentModuleEntity | null> {
    const setClauses: string[] = [];
    const params: any[] = [moduleId];
    let paramIndex = 2;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      params.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      params.push(updates.description);
    }
    if (updates.teamLeadId !== undefined) {
      setClauses.push(`team_lead_id = $${paramIndex++}`);
      params.push(updates.teamLeadId);
    }

    if (setClauses.length === 0) {
      return this.findModuleById(moduleId);
    }

    const sql =
      DepartmentsSql.UPDATE_MODULE_BASE +
      setClauses.join(', ') +
      ',' +
      DepartmentsSql.UPDATE_MODULE_RETURNING;

    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<any>(client, sql, params);
      return row ? DepartmentModuleModel.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async deleteModule(moduleId: string): Promise<boolean> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne<{ id: string }>(
        client,
        DepartmentsSql.DELETE_MODULE,
        [moduleId],
      );
      return !!row;
    } finally {
      client.release();
    }
  }
}
