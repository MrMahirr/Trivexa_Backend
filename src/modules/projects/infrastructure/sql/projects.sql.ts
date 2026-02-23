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
};
