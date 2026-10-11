import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import {
  Project,
  ProjectGithubIntegrationEntity,
  ProjectEntity,
  ProjectMember,
} from '../domain/project.entity';
import { ProjectsSql } from './sql/projects.sql';

export interface ProjectCodeProcessTaskSummary {
  total: number;
  byStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    BLOCKED: number;
    DONE: number;
  };
  doneThisWeek: number;
}

export interface ProjectCodeProcessRecentTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: Date | string;
  dueDate?: Date | string | null;
  assignee?: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

export interface ProjectCodeProcessTaskSnapshot {
  summary: ProjectCodeProcessTaskSummary;
  recentTasks: ProjectCodeProcessRecentTask[];
}

@Injectable()
export class ProjectsRepository {
  private githubIntegrationSchemaEnsured = false;

  constructor(
    private readonly dbPool: DatabasePool,
    private readonly cacheService: CacheService,
  ) {}

  private async ensureGithubIntegrationSchema(client: any): Promise<void> {
    if (this.githubIntegrationSchemaEnsured) return;

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'project_github_integrations'
        ) THEN
          ALTER TABLE project_github_integrations
            ADD COLUMN IF NOT EXISTS access_token TEXT;
        END IF;
      END
      $$;
    `);

    this.githubIntegrationSchemaEnsured = true;
  }

  async findAll(
    query: {
      page: number;
      limit: number;
      status?: string;
      clientId?: string;
      search?: string;
      myProjectsOnly?: boolean;
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
          // Ensure only assigned projects are returned if myProjectsOnly is requested, or if the user is not an Admin/Manager
          if (
            (query.myProjectsOnly ||
              (role && role !== 'ADMIN' && role !== 'MANAGER')) &&
            userId
          ) {
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

  async upsertGithubIntegration(data: {
    projectId: string;
    repositoryUrl: string;
    repositoryFullName: string;
    accessToken?: string | null;
    clearAccessToken?: boolean;
    userId: string;
  }): Promise<ProjectGithubIntegrationEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureGithubIntegrationSchema(client);
      const row = await BaseQuery.queryOne(
        client,
        ProjectsSql.upsertGithubIntegration,
        [
          data.projectId,
          data.repositoryUrl,
          data.repositoryFullName,
          data.accessToken ?? null,
          !!data.clearAccessToken,
          data.userId,
        ],
      );

      return Project.githubIntegrationFromRow(row);
    } finally {
      client.release();
    }
  }

  async findGithubIntegrationByProjectId(
    projectId: string,
  ): Promise<ProjectGithubIntegrationEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureGithubIntegrationSchema(client);
      const row = await BaseQuery.queryOne(
        client,
        ProjectsSql.findGithubIntegrationByProjectId,
        [projectId],
      );
      return row ? Project.githubIntegrationFromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async getCodeProcessTaskSnapshot(
    projectId: string,
    recentLimit = 12,
  ): Promise<ProjectCodeProcessTaskSnapshot> {
    const safeRecentLimit = Number.isFinite(recentLimit)
      ? Math.min(30, Math.max(1, Math.floor(recentLimit)))
      : 12;

    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const [summaryRow, recentRows] = await Promise.all([
        BaseQuery.queryOne<any>(client, ProjectsSql.codeProcessTaskSnapshot, [
          projectId,
        ]),
        BaseQuery.queryMany<any>(client, ProjectsSql.codeProcessRecentTasks, [
          projectId,
          safeRecentLimit,
        ]),
      ]);

      const toInt = (value: unknown) =>
        Number.isFinite(Number(value)) ? Number(value) : 0;

      return {
        summary: {
          total: toInt(summaryRow?.total_count),
          byStatus: {
            TODO: toInt(summaryRow?.todo_count),
            IN_PROGRESS: toInt(summaryRow?.in_progress_count),
            IN_REVIEW: toInt(summaryRow?.in_review_count),
            BLOCKED: toInt(summaryRow?.blocked_count),
            DONE: toInt(summaryRow?.done_count),
          },
          doneThisWeek: toInt(summaryRow?.done_this_week_count),
        },
        recentTasks: recentRows.map((row) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          priority: row.priority,
          updatedAt: row.updated_at,
          dueDate: row.due_date,
          assignee: row.assignee_id
            ? {
                id: row.assignee_id,
                email: row.assignee_email ?? null,
                firstName: row.assignee_first_name ?? null,
                lastName: row.assignee_last_name ?? null,
              }
            : null,
        })),
      };
    } finally {
      client.release();
    }
  }
}
