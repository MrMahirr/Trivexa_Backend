export const ClientUsersSql = {
  CREATE: `
    INSERT INTO client_users (client_id, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, client_id, email, password_hash, created_at
  `,
  FIND_BY_EMAIL: `
    SELECT id, client_id, email, password_hash, created_at
    FROM client_users WHERE email = $1
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
    UPDATE client_users SET password_hash = $1 WHERE id = $2 RETURNING id
  `,
};
