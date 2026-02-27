export const MeetingsSql = {
    CREATE: `
    INSERT INTO meetings (
        client_id, project_id, title, date, duration_minutes, link, notes, summary, organizer_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `,

    FIND_ALL_BASE: `
    SELECT * FROM meetings WHERE 1=1
  `,

    FIND_ALL_ORDER: `
    ORDER BY date DESC
  `,

    FIND_BY_ID: `
    SELECT * FROM meetings WHERE id = $1
  `
};
