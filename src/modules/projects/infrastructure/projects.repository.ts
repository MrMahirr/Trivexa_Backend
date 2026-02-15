import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { Project, ProjectEntity, ProjectMember } from '../domain/project.entity';

@Injectable()
export class ProjectsRepository {
    constructor(private readonly dbPool: DatabasePool) { }

    async findAll(
        query: { page: number; limit: number; status?: string; clientId?: string; search?: string },
        userId?: string,
        role?: string,
    ): Promise<{ data: ProjectEntity[]; total: number }> {
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
                conditions.push(`EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = $${idx})`);
                params.push(userId);
                idx++;
            }

            const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

            const countResult = await BaseQuery.queryOne<{ count: string }>(
                client,
                `SELECT COUNT(*) as count FROM projects p ${where}`,
                params,
            );
            const total = parseInt(countResult?.count || '0', 10);

            const offset = (query.page - 1) * query.limit;
            params.push(query.limit, offset);
            const rows = await BaseQuery.queryMany(
                client,
                `SELECT p.id, p.client_id, p.name, p.description, p.status, p.budget, p.start_date, p.deadline, p.created_by, p.created_at, p.updated_at
                 FROM projects p ${where}
                 ORDER BY p.created_at DESC
                 LIMIT $${idx++} OFFSET $${idx++}`,
                params,
            );

            return { data: rows.map(Project.fromRow), total };
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<ProjectEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT id, client_id, name, description, status, budget, start_date, deadline, created_by, created_at, updated_at
                 FROM projects WHERE id = $1`,
                [id],
            );
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

            const row = await BaseQuery.queryOne(
                client,
                `INSERT INTO projects (name, description, client_id, budget, start_date, deadline, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id, client_id, name, description, status, budget, start_date, deadline, created_by, created_at, updated_at`,
                [data.name, data.description || null, data.clientId, data.budget || 0, data.startDate || null, data.deadline || null, data.createdBy],
            );

            // Auto-add creator as PROJECT_LEAD
            await BaseQuery.execute(
                client,
                `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'PROJECT_LEAD')`,
                [row!.id, data.createdBy],
            );

            await client.query('COMMIT');
            return Project.fromRow(row);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async update(id: string, data: Partial<{
        name: string;
        description: string;
        budget: number;
        startDate: string;
        deadline: string;
    }>): Promise<ProjectEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const sets: string[] = [];
            const params: any[] = [];
            let idx = 1;

            if (data.name !== undefined) { sets.push(`name = $${idx++}`); params.push(data.name); }
            if (data.description !== undefined) { sets.push(`description = $${idx++}`); params.push(data.description); }
            if (data.budget !== undefined) { sets.push(`budget = $${idx++}`); params.push(data.budget); }
            if (data.startDate !== undefined) { sets.push(`start_date = $${idx++}`); params.push(data.startDate); }
            if (data.deadline !== undefined) { sets.push(`deadline = $${idx++}`); params.push(data.deadline); }

            if (sets.length === 0) return this.findById(id);

            sets.push('updated_at = NOW()');
            params.push(id);

            const row = await BaseQuery.queryOne(
                client,
                `UPDATE projects SET ${sets.join(', ')} WHERE id = $${idx}
                 RETURNING id, client_id, name, description, status, budget, start_date, deadline, created_by, created_at, updated_at`,
                params,
            );
            return row ? Project.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async updateStatus(id: string, status: string): Promise<ProjectEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2
                 RETURNING id, client_id, name, description, status, budget, start_date, deadline, created_by, created_at, updated_at`,
                [status, id],
            );
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
            const rows = await BaseQuery.queryMany(
                client,
                `SELECT pm.id, pm.project_id, pm.user_id, pm.role, pm.joined_at,
                        u.email, u.first_name, u.last_name
                 FROM project_members pm
                 JOIN users u ON u.id = pm.user_id
                 WHERE pm.project_id = $1
                 ORDER BY pm.joined_at`,
                [projectId],
            );
            return rows.map(Project.memberFromRow);
        } finally {
            client.release();
        }
    }

    async isMember(projectId: string, userId: string): Promise<boolean> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2`,
                [projectId, userId],
            );
            return !!row;
        } finally {
            client.release();
        }
    }

    async addMember(projectId: string, userId: string, role: string): Promise<ProjectMember> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `INSERT INTO project_members (project_id, user_id, role)
                 VALUES ($1, $2, $3)
                 RETURNING id, project_id, user_id, role, joined_at`,
                [projectId, userId, role],
            );
            return Project.memberFromRow(row);
        } finally {
            client.release();
        }
    }

    async removeMember(projectId: string, userId: string): Promise<boolean> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const count = await BaseQuery.execute(
                client,
                `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
                [projectId, userId],
            );
            return count > 0;
        } finally {
            client.release();
        }
    }

    // ── Metrics ──

    async getTaskMetrics(projectId: string): Promise<{ total: number; completed: number; percentage: number }> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne<{ total: string; completed: string }>(
                client,
                `SELECT
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'DONE') as completed
                 FROM tasks WHERE project_id = $1`,
                [projectId],
            );
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
