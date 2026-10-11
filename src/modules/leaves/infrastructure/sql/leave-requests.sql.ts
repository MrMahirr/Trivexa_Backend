export const LeaveRequestsSql = {
  FIND_ALL_BASE: `
    SELECT
      lr.id,
      lr.user_id,
      COALESCE(lr.department, u.department) AS department,
      lr.type,
      lr.status,
      lr.start_date,
      lr.end_date,
      lr.duration_days,
      lr.reason,
      lr.approved_by,
      lr.approved_at,
      lr.created_at,
      lr.updated_at,
      u.first_name,
      u.last_name,
      u.email
    FROM leave_requests lr
    JOIN users u ON u.id = lr.user_id
    WHERE 1 = 1
  `,
  FIND_ALL_ORDER: ` ORDER BY lr.created_at DESC`,
  FIND_BY_ID: `
    SELECT
      lr.id,
      lr.user_id,
      COALESCE(lr.department, u.department) AS department,
      lr.type,
      lr.status,
      lr.start_date,
      lr.end_date,
      lr.duration_days,
      lr.reason,
      lr.approved_by,
      lr.approved_at,
      lr.created_at,
      lr.updated_at,
      u.first_name,
      u.last_name,
      u.email
    FROM leave_requests lr
    JOIN users u ON u.id = lr.user_id
    WHERE lr.id = $1
  `,
  CREATE: `
    INSERT INTO leave_requests (
      id,
      user_id,
      department,
      type,
      status,
      start_date,
      end_date,
      duration_days,
      reason
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,
  UPDATE_STATUS: `
    UPDATE leave_requests
    SET status = $2,
        approved_by = $3,
        approved_at = $4,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
};
