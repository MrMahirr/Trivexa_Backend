import { DatabasePool } from '../pool';
import { Logger } from '@nestjs/common';

export abstract class BaseRepository<T> {
  protected readonly logger: Logger;

  constructor(
    protected readonly pool: DatabasePool,
    protected readonly tableName: string,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  protected async query<R = any>(text: string, params?: any[]): Promise<R[]> {
    const client = await this.pool.getPool().connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  protected async queryOne<R = any>(
    text: string,
    params?: any[],
  ): Promise<R | null> {
    const rows = await this.query<R>(text, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async findAll(): Promise<T[]> {
    return this.query<T>(`SELECT * FROM ${this.tableName}`);
  }

  async findById(id: string): Promise<T | null> {
    return this.queryOne<T>(`SELECT * FROM ${this.tableName} WHERE id = $1`, [
      id,
    ]);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
      [id],
    );
    return result.length > 0;
  }
}
