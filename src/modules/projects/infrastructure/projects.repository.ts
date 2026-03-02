import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import {
  Project,
  ProjectEntity,
  ProjectMember,
} from '../domain/project.entity';
import { ProjectsSql } from './sql/projects.sql';

@Injectable()
export class ProjectsRepository {
  constructor(
    private readonly dbPool: DatabasePool,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(
    query: {
      page: number;
      limit: number;
      status?: string;
      clientId?: string;
      search?: string;
    },
    userId?: string,
    role?: string,
  ): Promise<{ data: ProjectEntity[]; total: number }> {
    const cacheKey = `projects:list:${userId || 'public'}:${JSON.stringify(query)}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
          const conditions: string[] = [];
          const params: any[] = [];
          let idx = 1;

          if (query.status) {
            conditions.push(`p.status = $${idx++}`);
            params.push(query.status);
          }
          if (query.clientId) {
            conditions.push(`p.client_id = $${idx++}`);
            params.push(query.clientId);
          }
          if (query.search) {
            conditions.push(`LOWER(p.name) LIKE $${idx}`);
            params.push(`%${query.search.toLowerCase()}%`);
            idx++;
          }
          // Non-admin users see only their projects
          if (role && role !== 'ADMIN' && role !== 'MANAGER' && userId) {
            conditions.push(
              `EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = $${idx})`,
            );
            params.push(userId);
            idx++;
          }

          const where = conditions.length
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

          const countResult = await BaseQuery.queryOne<{ count: string }>(
            client,
            `${ProjectsSql.findAllCount} ${where}`,
            params,
          );
          const total = parseInt(countResult?.count || '0', 10);

          const offset = (query.page - 1) * query.limit;
          params.push(query.limit, offset);
          const rows = await BaseQuery.queryMany(
            client,
            `${ProjectsSql.findAllData} ${where}
                     ORDER BY p.created_at DESC
                     LIMIT $${idx++} OFFSET $${idx++}`,
            params,
          );

          return { data: rows.map((row) => Project.fromRow(row)), total };
        } finally {
          client.release();
        }
      },
      30,
    );
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, ProjectsSql.findById, [id]);
      return row ? Project.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async create(data: {
    name: string;
    description?: string;
    clientId: string;
    budget?: number;
    startDate?: string;
    deadline?: string;
    createdBy: string;
  }): Promise<ProjectEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const row = await BaseQuery.queryOne(client, ProjectsSql.createProject, [
        data.name,
        data.description || null,
        data.clientId,
        data.budget || 0,
        data.startDate || null,
        data.deadline || null,
        data.createdBy,
      ]);

      // Auto-add creator as PROJECT_LEAD
      await BaseQuery.execute(client, ProjectsSql.addMember, [
        row.id,
        data.createdBy,
        'PROJECT_LEAD',
      ]);

      await client.query('COMMIT');
      return Project.fromRow(row);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      budget: number;
      startDate: string;
      deadline: string;
      clientId: string;
    }>,
  ): Promise<ProjectEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const sets: string[] = [];
      const params: any[] = [];
      let idx = 1;

      if (data.name !== undefined) {
        sets.push(`name = $${idx++}`);
        params.push(data.name);
      }
      if (data.description !== undefined) {
        sets.push(`description = $${idx++}`);
        params.push(data.description);
      }
      if (data.budget !== undefined) {
        sets.push(`budget = $${idx++}`);
        params.push(data.budget);
      }
      if (data.startDate !== undefined) {
        sets.push(`start_date = $${idx++}`);
        params.push(data.startDate);
      }
      if (data.deadline !== undefined) {
        sets.push(`deadline = $${idx++}`);
        params.push(data.deadline);
      }
      if (data.clientId !== undefined) {
        sets.push(`client_id = $${idx++}`);
        params.push(data.clientId);
      }

      if (sets.length === 0) return this.findById(id);

      sets.push('updated_at = NOW()');
      params.push(id);

      const row = await BaseQuery.queryOne(
        client,
        `${ProjectsSql.updateProjectBase} ${sets.join(', ')} WHERE id = $${idx}
                 ${ProjectsSql.updateProjectReturning}`,
        params,
      );
      return row ? Project.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<ProjectEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, ProjectsSql.updateStatus, [
        status,
        id,
      ]);
      return row ? Project.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  // ── Members ──

  async getMembers(projectId: string): Promise<ProjectMember[]> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const rows = await BaseQuery.queryMany(client, ProjectsSql.getMembers, [
        projectId,
      ]);
      return rows.map((row) => Project.memberFromRow(row));
    } finally {
      client.release();
    }
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, ProjectsSql.isMember, [
        projectId,
        userId,
      ]);
      return !!row;
    } finally {
      client.release();
    }
  }

  async addMember(
    projectId: string,
    userId: string,
    role: string,
  ): Promise<ProjectMember> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, ProjectsSql.addMember, [
        projectId,
        userId,
        role,
      ]);
      return Project.memberFromRow(row);
    } finally {
      client.release();
    }
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const count = await BaseQuery.execute(client, ProjectsSql.removeMember, [
        projectId,
        userId,
      ]);
      return count > 0;
    } finally {
      client.release();
    }
  }

  // ── Metrics ──

  async getTaskMetrics(
    projectId: string,
  ): Promise<{ total: number; completed: number; percentage: number }> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne<{
        total: string;
        completed: string;
      }>(client, ProjectsSql.getTaskMetrics, [projectId]);
      const total = parseInt(row?.total || '0', 10);
      const completed = parseInt(row?.completed || '0', 10);
      return {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    } finally {
      client.release();
    }
  }
}
