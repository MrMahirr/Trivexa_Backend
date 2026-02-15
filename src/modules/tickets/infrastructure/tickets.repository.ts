import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { Ticket, TicketEntity } from '../domain/ticket.entity';

@Injectable()
export class TicketsRepository {
    constructor(private readonly dbPool: DatabasePool) { }

    async create(data: {
        subject: string;
        description: string;
        type: string;
        priority: string;
        createdBy: string;
    }): Promise<TicketEntity> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `INSERT INTO tickets (subject, description, type, priority, created_by)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [data.subject, data.description, data.type, data.priority, data.createdBy],
            );
            return Ticket.fromRow(row);
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<TicketEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `SELECT t.*,
                        c.email as creator_email, c.first_name as creator_first_name, c.last_name as creator_last_name,
                        a.email as assignee_email, a.first_name as assignee_first_name, a.last_name as assignee_last_name
                 FROM tickets t
                 JOIN users c ON c.id = t.created_by
                 LEFT JOIN users a ON a.id = t.assigned_to
                 WHERE t.id = $1`,
                [id],
            );
            return row ? Ticket.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async findAll(
        filters: { page?: number; limit?: number; status?: string; priority?: string; type?: string },
        userId?: string, // If provided, filter by creator or assignee
    ): Promise<{ data: TicketEntity[]; total: number }> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const conditions: string[] = [];
            const params: any[] = [];
            let idx = 1;

            if (filters.status) { conditions.push(`t.status = $${idx++}`); params.push(filters.status); }
            if (filters.priority) { conditions.push(`t.priority = $${idx++}`); params.push(filters.priority); }
            if (filters.type) { conditions.push(`t.type = $${idx++}`); params.push(filters.type); }

            // Access control: If userId provided (non-admin), show created OR assigned tickets
            if (userId) {
                conditions.push(`(t.created_by = $${idx} OR t.assigned_to = $${idx})`);
                params.push(userId);
                idx++;
            }

            const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            const page = filters.page || 1;
            const limit = filters.limit || 20;

            const countResult = await BaseQuery.queryOne<{ count: string }>(
                client,
                `SELECT COUNT(*) as count FROM tickets t ${where}`,
                params,
            );
            const total = parseInt(countResult?.count || '0', 10);

            const offset = (page - 1) * limit;
            params.push(limit, offset);
            const rows = await BaseQuery.queryMany(
                client,
                `SELECT t.*,
                        c.email as creator_email, c.first_name as creator_first_name, c.last_name as creator_last_name,
                        a.email as assignee_email, a.first_name as assignee_first_name, a.last_name as assignee_last_name
                 FROM tickets t
                 JOIN users c ON c.id = t.created_by
                 LEFT JOIN users a ON a.id = t.assigned_to
                 ${where}
                 ORDER BY t.created_at DESC
                 LIMIT $${idx++} OFFSET $${idx++}`,
                params,
            );
            return { data: rows.map(Ticket.fromRow), total };
        } finally {
            client.release();
        }
    }

    async updateStatus(id: string, status: string): Promise<TicketEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
                [status, id],
            );
            return row ? Ticket.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async assign(id: string, assigneeId: string): Promise<TicketEntity | null> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                `UPDATE tickets SET assigned_to = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
                [assigneeId, id],
            );
            return row ? Ticket.fromRow(row) : null;
        } finally {
            client.release();
        }
    }
}
