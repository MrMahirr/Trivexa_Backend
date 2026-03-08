export const ClientUsersSql = {
  CREATE: `
    INSERT INTO client_users (client_id, email, password_hash, force_password_change)
    VALUES ($1, $2, $3, $4)
    RETURNING id, client_id, email, password_hash, force_password_change, created_at
  `,
  FIND_BY_EMAIL: `
    SELECT id, client_id, email, password_hash, force_password_change, created_at
    FROM client_users WHERE email = $1
  `,
  FIND_BY_ID: `
    SELECT id, client_id, email, password_hash, force_password_change, created_at
    FROM client_users WHERE id = $1
  `,
  CREATE_ACCESS_LINK: `
    INSERT INTO client_access_links (client_user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id
  `,
  FIND_ACCESS_LINK_BY_TOKEN: `
    SELECT id, client_user_id, token, expires_at
    FROM client_access_links WHERE token = $1
  `,
  UPDATE_PASSWORD_HASH: `
    UPDATE client_users
    SET password_hash = $1, force_password_change = $2
    WHERE id = $3
    RETURNING id
  `,
  ENSURE_FORCE_PASSWORD_CHANGE_COLUMN: `
    ALTER TABLE client_users
    ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN NOT NULL DEFAULT false
  `,
};
