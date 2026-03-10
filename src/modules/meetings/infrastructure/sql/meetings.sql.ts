export const MeetingsSql = {
  CREATE: `
    INSERT INTO meetings (
        client_id, project_id, title, date, duration_minutes, link, notes, summary, organizer_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `,

  FIND_ALL_BASE: `
    SELECT m.*, c.company_name AS client_name, p.name AS project_name
    FROM meetings m
    LEFT JOIN clients c ON c.id = m.client_id
    LEFT JOIN projects p ON p.id = m.project_id
    WHERE 1=1
  `,

  FIND_ALL_ORDER: `
    ORDER BY m.date DESC
  `,

  FIND_BY_ID: `
    SELECT m.*, c.company_name AS client_name, p.name AS project_name
    FROM meetings m
    LEFT JOIN clients c ON c.id = m.client_id
    LEFT JOIN projects p ON p.id = m.project_id
    WHERE m.id = $1
  `,
};
