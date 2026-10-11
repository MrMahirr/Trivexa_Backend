export const DepartmentsSql = {
  CREATE: `
    INSERT INTO departments (
        id, name, description, manager_id
    )
    VALUES ($1, $2, $3, $4)
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

  FIND_MODULES_BY_DEPARTMENT_IDS: `
    SELECT *
    FROM department_modules
    WHERE department_id = ANY($1::uuid[])
    ORDER BY name ASC
  `,

  FIND_MODULE_BY_ID: `
    SELECT * FROM department_modules WHERE id = $1
  `,

  CREATE_MODULE: `
    INSERT INTO department_modules (
      id, department_id, name, description, team_lead_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,

  UPDATE_MODULE_BASE: `
    UPDATE department_modules SET
  `,

  UPDATE_MODULE_RETURNING: `
    updated_at = NOW() WHERE id = $1 RETURNING *
  `,

  DELETE_MODULE: `
    DELETE FROM department_modules WHERE id = $1 RETURNING id
  `,

  DELETE: `
    DELETE FROM departments WHERE id = $1 RETURNING id
  `,
};
