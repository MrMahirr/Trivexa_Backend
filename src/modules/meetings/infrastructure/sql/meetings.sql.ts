export const MeetingsSql = {
  CREATE: `
    INSERT INTO meetings (
        client_id, project_id, audience_type, department, title, date, duration_minutes, link, notes, summary, organizer_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `,

  FIND_ALL_BASE: `
    SELECT m.* FROM meetings m WHERE 1=1
  `,

  FIND_ALL_ORDER: `
    ORDER BY m.date DESC
  `,

  FIND_BY_ID: `
    SELECT * FROM meetings WHERE id = $1
  `,
};
