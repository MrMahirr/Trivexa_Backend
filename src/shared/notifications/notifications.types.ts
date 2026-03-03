/**
 * Shared Notification Tip Tanımları
 *
 * Bu dosya, merkezi bildirim sisteminde kullanılan
 * tüm ortak tip ve interface'leri tanımlar.
 */

/** Bildirim tipleri */
export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_RESOLVED = 'TICKET_RESOLVED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  INVOICE_ISSUED = 'INVOICE_ISSUED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  SYSTEM = 'SYSTEM',
}

/** Bildirim kanalları */
export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  WEBSOCKET = 'WEBSOCKET',
}

/** Bildirim oluşturma verileri */
export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channels?: NotificationChannel[];
  metadata?: Record<string, unknown>;
}

/** Toplu bildirim gönderme verileri */
export interface BulkNotificationPayload {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  channels?: NotificationChannel[];
  metadata?: Record<string, unknown>;
}
