export const CampaignsSql = {
  FIND_ALL_BASE: `
    SELECT c.*, p.name AS project_name
    FROM campaigns c
    LEFT JOIN projects p ON p.id = c.project_id
    WHERE 1=1
  `,

  FIND_ALL_COUNT: `
    SELECT COUNT(*)::int AS count
    FROM campaigns c
    LEFT JOIN projects p ON p.id = c.project_id
    WHERE 1=1
  `,

  FIND_BY_ID: `
    SELECT c.*, p.name AS project_name
    FROM campaigns c
    LEFT JOIN projects p ON p.id = c.project_id
    WHERE c.id = $1
  `,

  CREATE: `
    INSERT INTO campaigns (
      project_id, title, description, platform, objective, status,
      start_date, end_date, budget, owner, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `,
};
