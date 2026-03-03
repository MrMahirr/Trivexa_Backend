import { BaseDbEntity } from './base.interface';

export type FileEntityType =
  | 'CONTRACT'
  | 'INVOICE'
  | 'PROJECT'
  | 'TICKET'
  | 'EXPENSE';

export interface FileDb extends BaseDbEntity {
  file_name: string;
  file_path: string;
  mime_type?: string;
  size?: number;
  entity_type?: FileEntityType;
  entity_id?: string;
  uploaded_by?: string;
}
