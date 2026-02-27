export const TimeTrackingSql = {
    CREATE: `
    INSERT INTO time_entries (user_id, project_id, task_id, description, is_manual, start_time)
    VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
    RETURNING *
  `,

    FIND_BY_ID: `
    SELECT * FROM time_entries WHERE id = $1
  `,

    FIND_ACTIVE_TIMER: `
    SELECT * FROM time_entries 
    WHERE user_id = $1 AND end_time IS NULL 
    ORDER BY start_time DESC LIMIT 1
  `,

    STOP_TIMER: `
    UPDATE time_entries 
    SET end_time = $1, duration_minutes = $2, description = COALESCE($3, description), updated_at = NOW()
    WHERE id = $4
    RETURNING *
  `,

    DELETE: `
    DELETE FROM time_entries WHERE id = $1
  `,

    // NOTE: Pagination and dynamic filtering SQL (like in ListTimeEntriesQuery) 
    // are often built dynamically in code and are hard to put strictly in a constant struct.
    // But static parts can be placed here if needed.
};
