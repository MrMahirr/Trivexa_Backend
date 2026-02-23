import { PoolClient, QueryResult, QueryResultRow } from 'pg';

export class BaseQuery {
  static async queryOne<T extends QueryResultRow>(
    client: PoolClient,
    text: string,
    params: any[] = [],
  ): Promise<T | null> {
    const result: QueryResult<T> = await client.query(text, params);
    return result.rows[0] || null;
  }

  static async queryMany<T extends QueryResultRow>(
    client: PoolClient,
    text: string,
    params: any[] = [],
  ): Promise<T[]> {
    const result: QueryResult<T> = await client.query(text, params);
    return result.rows;
  }

  static async execute(
    client: PoolClient,
    text: string,
    params: any[] = [],
  ): Promise<number> {
    const result = await client.query(text, params);
    return result.rowCount || 0;
  }
}
