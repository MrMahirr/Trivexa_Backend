export const TasksSql = {
    findByProjectCount: `SELECT COUNT(*) as count FROM tasks t`,
    findByProjectData: `
        SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
               t.assignee_id, t.due_date, t.created_by, t.created_at, t.updated_at,
               u.email as assignee_email, u.first_name as assignee_first_name, u.last_name as assignee_last_name
        FROM tasks t
        LEFT JOIN users u ON u.id = t.assignee_id
    `,

    findById: `
        SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
               t.assignee_id, t.due_date, t.created_by, t.created_at, t.updated_at,
               u.email as assignee_email, u.first_name as assignee_first_name, u.last_name as assignee_last_name
        FROM tasks t
        LEFT JOIN users u ON u.id = t.assignee_id
        WHERE t.id = $1
    `,

    create: `
        INSERT INTO tasks (project_id, title, description, priority, assignee_id, due_date, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, project_id, title, description, status, priority, assignee_id, due_date, created_by, created_at, updated_at
    `,

    updateBase: `UPDATE tasks SET`,
    updateReturning: `RETURNING id, project_id, title, description, status, priority, assignee_id, due_date, created_by, created_at, updated_at`,

    updateStatus: `
        UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2
        RETURNING id, project_id, title, description, status, priority, assignee_id, due_date, created_by, created_at, updated_at
    `,

    findBlockers: `
        SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
               t.assignee_id, t.due_date, t.created_by, t.created_at, t.updated_at
        FROM task_dependencies td
        JOIN tasks t ON t.id = td.depends_on
        WHERE td.task_id = $1
    `,

    statsByStatus: `SELECT status, COUNT(*) as count FROM tasks`,
    statsByPriority: `SELECT priority, COUNT(*) as count FROM tasks`,
};
