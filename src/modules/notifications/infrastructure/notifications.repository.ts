import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { Notification } from '../domain/notification.entity';
import { NotificationQueryDto } from '../api/dto/notification-query.dto';
import { NotificationsSql } from './sql/notifications.sql';

@Injectable()
export class NotificationsRepository {
    constructor(private readonly dbPool: DatabasePool) { }

    async create(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        metadata?: Record<string, any>;
    }): Promise<Notification> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne(
                client,
                NotificationsSql.create,
                [data.userId, data.type, data.title, data.message, data.metadata || {}],
            );
            return new Notification(this.mapRow(row));
        } finally {
            client.release();
        }
    }

    async findByUser(userId: string, query: NotificationQueryDto): Promise<Notification[]> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const conditions: string[] = [`user_id = $1`];
            const params: any[] = [userId];
            let idx = 2;

            if (query.isRead !== undefined) {
                conditions.push(`is_read = $${idx++}`);
                params.push(query.isRead);
            }
            if (query.type) {
                conditions.push(`type = $${idx++}`);
                params.push(query.type);
            }

            const where = `WHERE ${conditions.join(' AND ')}`;

            const rows = await BaseQuery.queryMany(
                client,
                `${NotificationsSql.findByUserBase}
                 ${where}
                 ORDER BY created_at DESC
                 LIMIT 50`,
                params,
            );
            return rows.map(row => new Notification(this.mapRow(row)));
        } finally {
            client.release();
        }
    }

    async markAsRead(id: string): Promise<boolean> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const count = await BaseQuery.execute(
                client,
                NotificationsSql.markAsRead,
                [id]
            );
            return count > 0;
        } finally {
            client.release();
        }
    }

    async markAllAsRead(userId: string): Promise<void> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            await BaseQuery.execute(
                client,
                NotificationsSql.markAllAsRead,
                [userId]
            );
        } finally {
            client.release();
        }
    }

    async countUnread(userId: string): Promise<number> {
        const pool = this.dbPool.getPool();
        const client = await pool.connect();
        try {
            const row = await BaseQuery.queryOne<{ count: string }>(
                client,
                NotificationsSql.countUnread,
                [userId]
            );
            return parseInt(row?.count || '0', 10);
        } finally {
            client.release();
        }
    }

    private mapRow(row: any): Partial<Notification> {
        return {
            id: row.id,
            userId: row.user_id,
            type: row.type,
            title: row.title,
            message: row.message,
            isRead: row.is_read,
            metadata: row.metadata,
            createdAt: row.created_at,
        };
    }
}
