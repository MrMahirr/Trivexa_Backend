import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { Task, TaskEntity } from '../domain/task.entity';

@Injectable()
export class TasksRepository {
    constructor(private readonly dbPool: DatabasePool) { }

    async findByProject(
        projectId: string,
        filters: { status?: string; priority?: string; assigneeId?: string; page?: number; limit?: number },
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
                `SELECT COUNT(*) as count FROM tasks t ${where}`,
                params,
            );
            const total = parseInt(countResult?.count || '0', 10);

            const offset = (page - 1) * limit;
            params.push(limit, offset);
            const rows = await BaseQuery.queryMany(
                client,
                `SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
                        t.assignee_id, t.due_date, t.created_by, t.created_at, t.updated_at,
                        u.email as assignee_email, u.first_name as assignee_first_name, u.last_name as assignee_last_name
                 FROM tasks t
                 LEFT JOIN users u ON u.id = t.assignee_id
                 ${where}
                 ORDER BY
                    CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 END,
                    t.created_at DESC
                 LIMIT $${idx++} OFFSET $${idx++}`,
                params,
            );

            return { data: rows.map(Task.fromRow), total };
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<TaskEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
                        t.assignee_id, t.due_date, t.created_by, t.created_at, t.updated_at,
                        u.email as assignee_email, u.first_name as assignee_first_name, u.last_name as assignee_last_name
                 FROM tasks t
                 LEFT JOIN users u ON u.id = t.assignee_id
                 WHERE t.id = $1`,
                [id],
            );
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
            const row = await BaseQuery.queryOne(
                client,
                `INSERT INTO tasks (project_id, title, description, priority, assignee_id, due_date, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id, project_id, title, description, status, priority, assignee_id, due_date, created_by, created_at, updated_at`,
                [data.projectId, data.title, data.description || null, data.priority || 'MEDIUM', data.assigneeId || null, data.dueDate || null, data.createdBy],
            );
            return Task.fromRow(row);
        } finally {
            client.release();
        }
    }

    async update(id: string, data: Partial<{
        title: string;
        description: string;
        priority: string;
        assigneeId: string;
        dueDate: string;
    }>): Promise<TaskEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const sets: string[] = [];
            const params: any[] = [];
            let idx = 1;

            if (data.title !== undefined) { sets.push(`title = $${idx++}`); params.push(data.title); }
            if (data.description !== undefined) { sets.push(`description = $${idx++}`); params.push(data.description); }
            if (data.priority !== undefined) { sets.push(`priority = $${idx++}`); params.push(data.priority); }
            if (data.assigneeId !== undefined) { sets.push(`assignee_id = $${idx++}`); params.push(data.assigneeId); }
            if (data.dueDate !== undefined) { sets.push(`due_date = $${idx++}`); params.push(data.dueDate); }

            if (sets.length === 0) return this.findById(id);

            sets.push('updated_at = NOW()');
            params.push(id);

            const row = await BaseQuery.queryOne(
                client,
                `UPDATE tasks SET ${sets.join(', ')} WHERE id = $${idx}
                 RETURNING id, project_id, title, description, status, priority, assignee_id, due_date, created_by, created_at, updated_at`,
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
            const row = await BaseQuery.queryOne(
                client,
                `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2
                 RETURNING id, project_id, title, description, status, priority, assignee_id, due_date, created_by, created_at, updated_at`,
                [status, id],
            );
            return row ? Task.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async findBlockers(taskId: string): Promise<TaskEntity[]> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const rows = await BaseQuery.queryMany(
                client,
                `SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
                        t.assignee_id, t.due_date, t.created_by, t.created_at, t.updated_at
                 FROM task_dependencies td
                 JOIN tasks t ON t.id = td.depends_on
                 WHERE td.task_id = $1`,
                [taskId],
            );
            return rows.map(Task.fromRow);
        } finally {
            client.release();
        }
    }
}
