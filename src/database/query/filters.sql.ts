export interface FilterOptions {
  [key: string]: any;
}

export const buildWhereClause = (
  filters: FilterOptions,
  startParamIndex: number = 1,
): { sql: string; params: any[]; nextParamIndex: number } => {
  const conditions: string[] = [];
  const params: any[] = [];
  let currentIndex = startParamIndex;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = $${currentIndex}`);
      params.push(value);
      currentIndex++;
    }
  });

  const sql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return {
    sql,
    params,
    nextParamIndex: currentIndex,
  };
};
