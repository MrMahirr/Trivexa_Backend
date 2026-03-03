/**
 * Ticket SQL Sorguları
 */
export const TicketsSql = {
  findAllCount: `SELECT COUNT(*) as count FROM tickets t`,

  findAllData: `
    SELECT t.id, t.subject, t.description, t.type, t.status, t.priority,
           t.created_by, t.assigned_to, t.created_at, t.updated_at,
           uc.email as creator_email, uc.first_name as creator_first_name, uc.last_name as creator_last_name,
           ua.email as assignee_email, ua.first_name as assignee_first_name, ua.last_name as assignee_last_name
    FROM tickets t
    LEFT JOIN users uc ON uc.id = t.created_by
    LEFT JOIN users ua ON ua.id = t.assigned_to
  `,

  findById: `
    SELECT t.id, t.subject, t.description, t.type, t.status, t.priority,
           t.created_by, t.assigned_to, t.created_at, t.updated_at,
           uc.email as creator_email, uc.first_name as creator_first_name, uc.last_name as creator_last_name,
           ua.email as assignee_email, ua.first_name as assignee_first_name, ua.last_name as assignee_last_name
    FROM tickets t
    LEFT JOIN users uc ON uc.id = t.created_by
    LEFT JOIN users ua ON ua.id = t.assigned_to
    WHERE t.id = $1
  `,

  create: `
    INSERT INTO tickets (subject, description, type, priority, created_by, assigned_to)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, subject, description, type, status, priority, created_by, assigned_to, created_at, updated_at
  `,

  updateStatus: `
    UPDATE tickets SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, subject, description, type, status, priority, created_by, assigned_to, created_at, updated_at
  `,

  assign: `
    UPDATE tickets SET assigned_to = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, subject, description, type, status, priority, created_by, assigned_to, created_at, updated_at
  `,
};
