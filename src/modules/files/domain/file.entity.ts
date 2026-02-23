export enum FileEntityType {
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  PROJECT = 'PROJECT',
  TICKET = 'TICKET',
  EXPENSE = 'EXPENSE',
}

export interface FileEntity {
  id: string;
  fileName: string;
  filePath: string;
  mimeType?: string;
  size?: number;
  entityType?: FileEntityType;
  entityId?: string;
  uploadedBy?: string;
  createdAt: Date;
}

export class FileRecord implements FileEntity {
  id: string;
  fileName: string;
  filePath: string;
  mimeType?: string;
  size?: number;
  entityType?: FileEntityType;
  entityId?: string;
  uploadedBy?: string;
  createdAt: Date;

  static fromRow(row: any): FileRecord {
    const entity = new FileRecord();
    entity.id = row.id;
    entity.fileName = row.file_name;
    entity.filePath = row.file_path;
    entity.mimeType = row.mime_type;
    entity.size = row.size ? parseInt(row.size, 10) : undefined;
    entity.entityType = row.entity_type;
    entity.entityId = row.entity_id;
    entity.uploadedBy = row.uploaded_by;
    entity.createdAt = row.created_at;
    return entity;
  }
}
