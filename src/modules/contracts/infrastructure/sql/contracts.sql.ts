export const ContractsSql = {
  CREATE: `
    INSERT INTO contracts (
        client_id, title, description, status, start_date, end_date, value, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `,

  FIND_BY_ID: `
    SELECT * FROM contracts WHERE id = $1
  `,

  FIND_ALL_BASE: `
    SELECT * FROM contracts WHERE 1=1
  `,

  FIND_ALL_ORDER: `
    ORDER BY created_at DESC
  `,

  UPDATE_STATUS_BASE: `
    UPDATE contracts SET status = $2
  `,

  UPDATE_SIGNED_URL: `
    , signed_url = $3
  `,

  UPDATE_RETURNING: `
    , updated_at = NOW() WHERE id = $1 RETURNING *
  `,
};
