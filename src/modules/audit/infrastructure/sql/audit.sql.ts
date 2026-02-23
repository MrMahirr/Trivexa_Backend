export const AuditSql = {
  create: `
        INSERT INTO audit_logs (user_id, action, resource, resource_id, old_data, new_data, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, action, resource, resource_id, old_data, new_data, ip_address, user_agent, created_at
    `,
};
