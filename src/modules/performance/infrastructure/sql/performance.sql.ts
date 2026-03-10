export const PerformanceSql = {
  FIND_ALL_BASE: `
    SELECT
      pr.id,
      pr.user_id,
      pr.period_start,
      pr.period_end,
      pr.score,
      pr.bonus_amount,
      pr.notes,
      pr.created_by,
      pr.created_at,
      pr.updated_at,
      u.first_name,
      u.last_name,
      u.email
    FROM performance_reviews pr
    JOIN users u ON u.id = pr.user_id
    WHERE 1 = 1
  `,
  FIND_ALL_ORDER: ` ORDER BY pr.period_start DESC, pr.created_at DESC`,
  UPSERT: `
    INSERT INTO performance_reviews (
      user_id,
      period_start,
      period_end,
      score,
      bonus_amount,
      notes,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id, period_start, period_end)
    DO UPDATE SET
      score = EXCLUDED.score,
      bonus_amount = EXCLUDED.bonus_amount,
      notes = EXCLUDED.notes,
      created_by = EXCLUDED.created_by,
      updated_at = NOW()
    RETURNING *
  `,
};
