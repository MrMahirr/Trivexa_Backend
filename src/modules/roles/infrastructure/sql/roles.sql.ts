export const RolesSql = {
  findAll: `
    SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt"
    FROM roles
    ORDER BY name ASC
  `,
  findById: `
    SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt"
    FROM roles
    WHERE id = $1
  `,
  findByName: `
    SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt"
    FROM roles
    WHERE name = $1
  `,
  create: `
    INSERT INTO roles (name, description)
    VALUES ($1, $2)
    RETURNING id, name, description, created_at as "createdAt", updated_at as "updatedAt"
  `,
  updateBase: `
    UPDATE roles SET
  `,
  delete: `
    DELETE FROM roles WHERE id = $1 RETURNING id
  `,
};
