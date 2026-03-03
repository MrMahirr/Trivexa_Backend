import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { Task, TaskEntity } from '../domain/task.entity';
import { TasksSql } from './sql/tasks.sql';

@Injectable()
export class TasksRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async findByProject(
    projectId: string,
    filters: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: TaskEntity[]; total: number }> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const conditions: string[] = ['t.project_id = $1'];
      const params: any[] = [projectId];
      let idx = 2;

      if (filters.status) {
        conditions.push(`t.status = $${idx++}`);
        params.push(filters.status);
      }
      if (filters.priority) {
        conditions.push(`t.priority = $${idx++}`);
        params.push(filters.priority);
      }
      if (filters.assigneeId) {
        conditions.push(`t.assignee_id = $${idx++}`);
        params.push(filters.assigneeId);
      }

      const where = `WHERE ${conditions.join(' AND ')}`;
      const page = filters.page || 1;
      const limit = filters.limit || 50;

      const countResult = await BaseQuery.queryOne<{ count: string }>(
        client,
        `${TasksSql.findByProjectCount} ${where}`,
        params,
      );
      const total = parseInt(countResult?.count || '0', 10);

      const offset = (page - 1) * limit;
      params.push(limit, offset);
      const rows = await BaseQuery.queryMany(
        client,
        `${TasksSql.findByProjectData} ${where}
                 ORDER BY
                    CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 END,
                    t.created_at DESC
                 LIMIT $${idx++} OFFSET $${idx++}`,
        params,
      );

      return { data: rows.map((row) => Task.fromRow(row)), total };
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, TasksSql.findById, [id]);
      return row ? Task.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async create(data: {
    projectId: string;
    title: string;
    description?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
    createdBy: string;
  }): Promise<TaskEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, TasksSql.create, [
        data.projectId,
        data.title,
        data.description || null,
        data.priority || 'MEDIUM',
        data.assigneeId || null,
        data.dueDate || null,
        data.createdBy,
      ]);
      return Task.fromRow(row);
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      priority: string;
      assigneeId: string;
      dueDate: string;
    }>,
  ): Promise<TaskEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const sets: string[] = [];
      const params: any[] = [];
      let idx = 1;

      if (data.title !== undefined) {
        sets.push(`title = $${idx++}`);
        params.push(data.title);
      }
      if (data.description !== undefined) {
        sets.push(`description = $${idx++}`);
        params.push(data.description);
      }
      if (data.priority !== undefined) {
        sets.push(`priority = $${idx++}`);
        params.push(data.priority);
      }
      if (data.assigneeId !== undefined) {
        sets.push(`assignee_id = $${idx++}`);
        params.push(data.assigneeId);
      }
      if (data.dueDate !== undefined) {
        sets.push(`due_date = $${idx++}`);
        params.push(data.dueDate);
      }

      if (sets.length === 0) return this.findById(id);

      sets.push('updated_at = NOW()');
      params.push(id);

      const row = await BaseQuery.queryOne(
        client,
        `${TasksSql.updateBase} ${sets.join(', ')} WHERE id = $${idx}
                 ${TasksSql.updateReturning}`,
        params,
      );
      return row ? Task.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async updateStatus(id: string, status: string): Promise<TaskEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, TasksSql.updateStatus, [
        status,
        id,
      ]);
      return row ? Task.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findBlockers(taskId: string): Promise<TaskEntity[]> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const rows = await BaseQuery.queryMany(client, TasksSql.findBlockers, [
        taskId,
      ]);
      return rows.map((row) => Task.fromRow(row));
    } finally {
      client.release();
    }
  }

  async getStatistics(projectId?: string): Promise<{
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      let where = '';
      const params: any[] = [];

      if (projectId) {
        where = 'WHERE project_id = $1';
        params.push(projectId);
      }

      const statusSql = `${TasksSql.statsByStatus} ${where} GROUP BY status`;
      const prioritySql = `${TasksSql.statsByPriority} ${where} GROUP BY priority`;

      const [statusRows, priorityRows] = await Promise.all([
        BaseQuery.queryMany<any>(client, statusSql, params),
        BaseQuery.queryMany<any>(client, prioritySql, params),
      ]);

      const byStatus: Record<string, number> = {};
      statusRows.forEach(
        (row) => (byStatus[row.status] = parseInt(row.count, 10)),
      );

      const byPriority: Record<string, number> = {};
      priorityRows.forEach(
        (row) => (byPriority[row.priority] = parseInt(row.count, 10)),
      );

      return { byStatus, byPriority };
    } finally {
      client.release();
    }
  }
}
