export const ClientsSql = {
    CREATE: `
    INSERT INTO clients (company_name, contact_person, email, phone, address)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, company_name, contact_person, email, phone, address, is_active, created_at, updated_at
  `,
    FIND_BY_ID: `
    SELECT id, company_name, contact_person, email, phone, address, is_active, created_at, updated_at
    FROM clients WHERE id = $1
  `,
    FIND_BY_EMAIL: `
    SELECT id, company_name, contact_person, email, phone, address, is_active, created_at, updated_at
    FROM clients WHERE email = $1
  `,
    FIND_BY_COMPANY_NAME: `
    SELECT id, company_name, contact_person, email, phone, address, is_active, created_at, updated_at
    FROM clients WHERE LOWER(company_name) = LOWER($1)
  `,
    UPDATE: `
    UPDATE clients SET
      company_name = COALESCE($1, company_name),
      contact_person = COALESCE($2, contact_person),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      address = COALESCE($5, address),
      is_active = COALESCE($6, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING id, company_name, contact_person, email, phone, address, is_active, created_at, updated_at
  `
};
