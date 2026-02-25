export const PermissionsSql = {
    findAll: `
    SELECT id, name, description
    FROM permissions
    ORDER BY name ASC
  `,
    findByRoleId: `
    SELECT p.id, p.name, p.description
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    WHERE rp.role_id = $1
  `,
    assignPermissions: `
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `,
    clearRolePermissions: `
    DELETE FROM role_permissions WHERE role_id = $1
  `,
};
