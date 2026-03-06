export const TasksSql = {
  findByProjectCount: `SELECT COUNT(*) as count FROM tasks t`,
  findByProjectData: `
        SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
               t.assignee_id, t.due_date, t.created_by, t.created_at, t.updated_at,
               u.email as assignee_email, u.first_name as assignee_first_name, u.last_name as assignee_last_name,
               COALESCE((
                   SELECT json_agg(
                       json_build_object(
                           'user_id', ta.user_id,
                           'email', au.email,
                           'first_name', au.first_name,
                           'last_name', au.last_name
                       )
                       ORDER BY au.first_name, au.last_name
                   )
                   FROM task_assignees ta
                   JOIN users au ON au.id = ta.user_id
                   WHERE ta.task_id = t.id
               ), '[]'::json) as assignees
        FROM tasks t
        LEFT JOIN users u ON u.id = t.assignee_id
    `,

  findById: `
        SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
               t.assignee_id, t.due_date, t.created_by, t.created_at, t.updated_at,
               u.email as assignee_email, u.first_name as assignee_first_name, u.last_name as assignee_last_name,
               COALESCE((
                   SELECT json_agg(
                       json_build_object(
                           'user_id', ta.user_id,
                           'email', au.email,
                           'first_name', au.first_name,
                           'last_name', au.last_name
                       )
                       ORDER BY au.first_name, au.last_name
                   )
                   FROM task_assignees ta
                   JOIN users au ON au.id = ta.user_id
                   WHERE ta.task_id = t.id
               ), '[]'::json) as assignees
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
               t.assignee_id, t.due_date, t.created_by, t.created_at, t.updated_at,
               COALESCE((
                   SELECT json_agg(
                       json_build_object(
                           'user_id', ta.user_id,
                           'email', au.email,
                           'first_name', au.first_name,
                           'last_name', au.last_name
                       )
                       ORDER BY au.first_name, au.last_name
                   )
                   FROM task_assignees ta
                   JOIN users au ON au.id = ta.user_id
                   WHERE ta.task_id = t.id
               ), '[]'::json) as assignees
        FROM task_dependencies td
        JOIN tasks t ON t.id = td.depends_on
        WHERE td.task_id = $1
    `,

  clearAssignees: `DELETE FROM task_assignees WHERE task_id = $1`,
  insertAssignees: `
        INSERT INTO task_assignees (task_id, user_id)
        SELECT $1::uuid, unnest($2::uuid[])
        ON CONFLICT (task_id, user_id) DO NOTHING
    `,

  statsByStatus: `SELECT status, COUNT(*) as count FROM tasks`,
  statsByPriority: `SELECT priority, COUNT(*) as count FROM tasks`,
};
