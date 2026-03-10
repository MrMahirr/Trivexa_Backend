import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { FileRecord, FileEntity } from '../domain/file.entity';

interface FindAllFilters {
  entityType?: string;
  entityId?: string;
  uploadedBy?: string;
  search?: string;
  limit: number;
  offset: number;
}

@Injectable()
export class FilesRepository {
  constructor(private readonly db: DatabasePool) {}

  async create(fileData: FileEntity, client?: PoolClient): Promise<FileEntity> {
    const sql = `
            INSERT INTO files (
                file_name, file_path, mime_type, size, entity_type, entity_id, uploaded_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
    const params = [
      fileData.fileName,
      fileData.filePath,
      fileData.mimeType,
      fileData.size,
      fileData.entityType,
      fileData.entityId,
      fileData.uploadedBy,
    ];

    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const row = await BaseQuery.queryOne<any>(dbClient, sql, params);
      return FileRecord.fromRow(row);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findById(id: string): Promise<FileEntity | null> {
    const sql = `SELECT * FROM files WHERE id = $1`;
    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(client, sql, [id]);
      return row ? FileRecord.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<FileEntity[]> {
    const sql = `SELECT * FROM files WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC`;
    const client = await this.db.getPool().connect();
    try {
      const rows = await BaseQuery.queryMany<any>(client, sql, [
        entityType,
        entityId,
      ]);
      return rows.map((row) => FileRecord.fromRow(row));
    } finally {
      client.release();
    }
  }

  async findAll(filters: FindAllFilters): Promise<FileEntity[]> {
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (filters.entityType) {
      params.push(filters.entityType);
      whereClauses.push(`entity_type = $${params.length}`);
    }

    if (filters.entityId) {
      params.push(filters.entityId);
      whereClauses.push(`entity_id = $${params.length}`);
    }

    if (filters.uploadedBy) {
      params.push(filters.uploadedBy);
      whereClauses.push(`uploaded_by = $${params.length}`);
    }

    if (filters.search?.trim()) {
      params.push(`%${filters.search.trim()}%`);
      whereClauses.push(
        `(file_name ILIKE $${params.length} OR CAST(id AS TEXT) ILIKE $${params.length} OR CAST(entity_id AS TEXT) ILIKE $${params.length})`,
      );
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    params.push(filters.limit);
    const limitIndex = params.length;
    params.push(filters.offset);
    const offsetIndex = params.length;

    const sql = `
      SELECT *
      FROM files
      ${where}
      ORDER BY created_at DESC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const client = await this.db.getPool().connect();
    try {
      const rows = await BaseQuery.queryMany<any>(client, sql, params);
      return rows.map((row) => FileRecord.fromRow(row));
    } finally {
      client.release();
    }
  }
}
