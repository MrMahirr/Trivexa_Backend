/**
 * Tüm veritabanı tablolarının ortak alanları.
 * Her entity bu interface'i extend eder.
 */
export interface BaseDbEntity {
  id: string;
  created_at: Date;
  updated_at?: Date;
}

/**
 * Soft-delete destekleyen tablolar için ek alan
 */
export interface SoftDeletable {
  deleted_at?: Date | null;
  is_deleted?: boolean;
}

/**
 * Sadece oluşturma zamanı tutan tablolar (log tabloları vb.)
 */
export interface TimestampedEntity {
  id: string;
  created_at: Date;
}

/**
 * Sayfalanmış DB sorgu sonucu
 */
export interface PaginatedDbResult<T> {
  rows: T[];
  total: number;
}
