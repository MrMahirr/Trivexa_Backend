/**
 * Shared Audit Tip Tanımları
 *
 * Bu dosya, denetim (audit) loglarında kullanılan ortak tipleri tanımlar.
 * event.types.ts dosyasındaki GenericAuditLogEvent ile birlikte kullanılır.
 */

/** Desteklenen audit aksiyonları */
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'OTHER';

/** Denetim logu oluşturma verileri */
export interface CreateAuditLogData {
  entityName: string;
  entityId: string;
  action: AuditAction;
  userId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/** Denetim logu sonuç verisi (DB'den okunan) */
export interface AuditLogEntry {
  id: string;
  entityName: string;
  entityId: string;
  action: AuditAction;
  userId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/** Denetim logları filtreleme */
export interface AuditLogFilter {
  userId?: string;
  entityName?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
