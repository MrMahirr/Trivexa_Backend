export const DepartmentsSql = {
    CREATE: `
    INSERT INTO departments (
        name, description, manager_id
    )
    VALUES ($1, $2, $3)
    RETURNING *;
  `,

    UPDATE_BASE: `
    UPDATE departments SET 
  `,

    UPDATE_RETURNING: `
    updated_at = NOW() WHERE id = $1 RETURNING *
  `,

    FIND_ALL: `
    SELECT * FROM departments ORDER BY name ASC
  `,

    FIND_BY_ID: `
    SELECT * FROM departments WHERE id = $1
  `,

    DELETE: `
    DELETE FROM departments WHERE id = $1 RETURNING id
  `
};
