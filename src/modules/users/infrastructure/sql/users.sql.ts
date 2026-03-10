export const UsersSql = {
  findAllCount: `SELECT COUNT(*) as count FROM users`,
  findAllData: `
        SELECT
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          u.department,
          u.sub_department_id,
          dm.name AS sub_department_name,
          u.phone,
          u.address,
          u.avatar_url,
          u.avatar_fit,
          u.avatar_position,
          u.is_active,
          u.force_password_change,
          u.created_at,
          u.updated_at
        FROM users u
        LEFT JOIN department_modules dm ON dm.id = u.sub_department_id
    `,

  findById: `
        SELECT
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          u.department,
          u.sub_department_id,
          dm.name AS sub_department_name,
          u.phone,
          u.address,
          u.avatar_url,
          u.avatar_fit,
          u.avatar_position,
          u.is_active,
          u.force_password_change,
          u.created_at,
          u.updated_at
        FROM users u
        LEFT JOIN department_modules dm ON dm.id = u.sub_department_id
        WHERE u.id = $1
    `,

  findByEmail: `
        SELECT
          u.id,
          u.email,
          u.password_hash,
          u.first_name,
          u.last_name,
          u.role,
          u.department,
          u.sub_department_id,
          dm.name AS sub_department_name,
          u.phone,
          u.address,
          u.avatar_url,
          u.avatar_fit,
          u.avatar_position,
          u.is_active,
          u.force_password_change,
          u.created_at,
          u.updated_at
        FROM users u
        LEFT JOIN department_modules dm ON dm.id = u.sub_department_id
        WHERE u.email = $1
    `,

  create: `
        INSERT INTO users (email, password_hash, first_name, last_name, role, department, sub_department_id, force_password_change)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, email, first_name, last_name, role, department, sub_department_id, phone, address, avatar_url, avatar_fit, avatar_position, is_active, force_password_change, created_at, updated_at
    `,

  updateBase: `UPDATE users SET`,
  updateReturning: `RETURNING id, email, first_name, last_name, role, department, sub_department_id, phone, address, avatar_url, avatar_fit, avatar_position, is_active, force_password_change, created_at, updated_at`,

  deactivate: `
        UPDATE users SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, first_name, last_name, role, department, sub_department_id, phone, address, avatar_url, avatar_fit, avatar_position, is_active, force_password_change, created_at, updated_at
    `,

  activate: `
        UPDATE users SET is_active = true, updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, first_name, last_name, role, department, sub_department_id, phone, address, avatar_url, avatar_fit, avatar_position, is_active, force_password_change, created_at, updated_at
    `,

  updatePassword: `UPDATE users SET password_hash = $1, force_password_change = false, updated_at = NOW() WHERE id = $2`,

  findPasswordHashById: `SELECT password_hash FROM users WHERE id = $1`,
};
