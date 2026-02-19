export const UsersSql = {
    findAllCount: `SELECT COUNT(*) as count FROM users`,
    findAllData: `
        SELECT id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at
        FROM users
    `,

    findById: `
        SELECT id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at
        FROM users WHERE id = $1
    `,

    findByEmail: `
        SELECT id, email, password_hash, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at
        FROM users WHERE email = $1
    `,

    create: `
        INSERT INTO users (email, password_hash, first_name, last_name, role, department)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at
    `,

    updateBase: `UPDATE users SET`,
    updateReturning: `RETURNING id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at`,

    deactivate: `
        UPDATE users SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, first_name, last_name, role, department, is_active, force_password_change, created_at, updated_at
    `,

    updatePassword: `UPDATE users SET password_hash = $1, force_password_change = false, updated_at = NOW() WHERE id = $2`,

    findPasswordHashById: `SELECT password_hash FROM users WHERE id = $1`,
};
