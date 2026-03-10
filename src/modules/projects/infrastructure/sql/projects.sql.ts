export const ProjectsSql = {
  findAllCount: `SELECT COUNT(*) as count FROM projects p`,
  findAllData: `
        SELECT p.id, p.client_id, p.name, p.description, p.status, p.budget, p.start_date, p.deadline, p.created_by, p.created_at, p.updated_at
        FROM projects p
    `,

  findById: `
        SELECT id, client_id, name, description, status, budget, start_date, deadline, created_by, created_at, updated_at
        FROM projects WHERE id = $1
    `,

  createProject: `
        INSERT INTO projects (name, description, client_id, budget, start_date, deadline, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, client_id, name, description, status, budget, start_date, deadline, created_by, created_at, updated_at
    `,

  addMember: `
        INSERT INTO project_members (project_id, user_id, role)
        VALUES ($1, $2, $3)
        RETURNING id, project_id, user_id, role, joined_at
    `,

  updateProjectBase: `UPDATE projects SET`,
  updateProjectReturning: `RETURNING id, client_id, name, description, status, budget, start_date, deadline, created_by, created_at, updated_at`,

  updateStatus: `
        UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2
        RETURNING id, client_id, name, description, status, budget, start_date, deadline, created_by, created_at, updated_at
    `,

  getMembers: `
        SELECT pm.id, pm.project_id, pm.user_id, pm.role, pm.joined_at,
               u.email, u.first_name, u.last_name
        FROM project_members pm
        JOIN users u ON u.id = pm.user_id
        WHERE pm.project_id = $1
        ORDER BY pm.joined_at
    `,

  isMember: `SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2`,

  removeMember: `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,

  getTaskMetrics: `
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'DONE') as completed
        FROM tasks WHERE project_id = $1
    `,

  upsertGithubIntegration: `
        INSERT INTO project_github_integrations (
            project_id, repository_url, repository_full_name, access_token, created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $6, $6)
        ON CONFLICT (project_id)
        DO UPDATE SET
            repository_url = EXCLUDED.repository_url,
            repository_full_name = EXCLUDED.repository_full_name,
            access_token = CASE
                WHEN $5::boolean = true THEN NULL
                WHEN $4 IS NOT NULL THEN $4
                ELSE project_github_integrations.access_token
            END,
            updated_by = EXCLUDED.updated_by,
            updated_at = NOW()
        RETURNING
            id, project_id, repository_url, repository_full_name, access_token,
            (access_token IS NOT NULL) as has_custom_token,
            created_by, updated_by, created_at, updated_at
    `,

  findGithubIntegrationByProjectId: `
        SELECT
            id, project_id, repository_url, repository_full_name, access_token,
            (access_token IS NOT NULL) as has_custom_token,
            created_by, updated_by, created_at, updated_at
        FROM project_github_integrations
        WHERE project_id = $1
    `,

  codeProcessTaskSnapshot: `
        SELECT
            COUNT(*)::int as total_count,
            COUNT(*) FILTER (WHERE status = 'TODO')::int as todo_count,
            COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')::int as in_progress_count,
            COUNT(*) FILTER (WHERE status = 'IN_REVIEW')::int as in_review_count,
            COUNT(*) FILTER (WHERE status = 'BLOCKED')::int as blocked_count,
            COUNT(*) FILTER (WHERE status = 'DONE')::int as done_count,
            COUNT(*) FILTER (
                WHERE status = 'DONE' AND updated_at >= NOW() - INTERVAL '7 days'
            )::int as done_this_week_count
        FROM tasks
        WHERE project_id = $1
    `,

  codeProcessRecentTasks: `
        SELECT
            t.id,
            t.title,
            t.status,
            t.priority,
            t.updated_at,
            t.due_date,
            t.assignee_id,
            u.email as assignee_email,
            u.first_name as assignee_first_name,
            u.last_name as assignee_last_name
        FROM tasks t
        LEFT JOIN users u ON u.id = t.assignee_id
        WHERE t.project_id = $1
        ORDER BY t.updated_at DESC
        LIMIT $2
    `,
};
