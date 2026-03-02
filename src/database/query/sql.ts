/**
 * Ortak SQL yardımcı fonksiyonları.
 *
 * Repository'lerde tekrarlanan SQL yapı taşlarını (search, ORDER BY,
 * INSERT, UPDATE) merkezi olarak sağlar.
 *
 * Not: buildWhereClause zaten filters.sql.ts içinde tanımlıdır.
 */

/**
 * ILIKE tabanlı metin arama SQL'i üretir
 */
export function buildSearchClause(
  columns: string[],
  searchTerm: string | undefined,
  paramIndex: number,
): { sql: string; values: unknown[]; nextIndex: number } {
  if (!searchTerm || searchTerm.trim() === '') {
    return { sql: '', values: [], nextIndex: paramIndex };
  }

  const conditions = columns.map((col) => `${col} ILIKE $${paramIndex}`);
  const sql = `(${conditions.join(' OR ')})`;

  return {
    sql,
    values: [`%${searchTerm.trim()}%`],
    nextIndex: paramIndex + 1,
  };
}

/**
 * ORDER BY cümlesi üretir
 */
export function buildOrderByClause(
  sortBy?: string,
  sortOrder?: 'ASC' | 'DESC',
  defaultSort = 'created_at',
  defaultOrder: 'ASC' | 'DESC' = 'DESC',
  allowedColumns: string[] = [],
): string {
  const column =
    sortBy && (allowedColumns.length === 0 || allowedColumns.includes(sortBy))
      ? sortBy
      : defaultSort;
  const order = sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : defaultOrder;

  return `ORDER BY ${column} ${order}`;
}

/**
 * INSERT INTO ... VALUES SQL'i otomatik üretir
 */
export function buildInsertSql(
  tableName: string,
  data: Record<string, unknown>,
  startIndex = 1,
): { sql: string; values: unknown[]; nextIndex: number } {
  const columns: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];
  let paramIndex = startIndex;

  for (const [column, value] of Object.entries(data)) {
    if (value === undefined) continue;
    columns.push(column);
    placeholders.push(`$${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;

  return { sql, values, nextIndex: paramIndex };
}

/**
 * UPDATE SET ... WHERE id = ... SQL'i otomatik üretir
 */
export function buildUpdateSql(
  tableName: string,
  id: string,
  data: Record<string, unknown>,
  startIndex = 1,
): { sql: string; values: unknown[]; nextIndex: number } {
  const sets: string[] = [];
  const values: unknown[] = [];
  let paramIndex = startIndex;

  for (const [column, value] of Object.entries(data)) {
    if (value === undefined) continue;
    sets.push(`${column} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  values.push(id);
  const sql = `UPDATE ${tableName} SET ${sets.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

  return { sql, values, nextIndex: paramIndex + 1 };
}
