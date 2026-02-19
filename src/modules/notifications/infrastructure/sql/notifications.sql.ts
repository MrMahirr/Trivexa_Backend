export const NotificationsSql = {
    create: `
        INSERT INTO notifications (user_id, type, title, message, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, type, title, message, is_read, metadata, created_at
    `,

    findByUserBase: `
        SELECT id, user_id, type, title, message, is_read, metadata, created_at
        FROM notifications
    `,

    markAsRead: `UPDATE notifications SET is_read = true WHERE id = $1`,

    markAllAsRead: `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,

    countUnread: `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
};
