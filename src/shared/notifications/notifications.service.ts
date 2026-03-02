import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NotificationPayload,
  BulkNotificationPayload,
  NotificationChannel,
} from './notifications.types';

/**
 * SharedNotificationsService — Merkezi bildirim gönderme servisi.
 *
 * Diğer modüller bu servis üzerinden bildirim gönderir.
 * Bildirimler kanal yapılandırmasına göre (IN_APP, EMAIL, WEBSOCKET)
 * ilgili alt sistemlere event olarak yönlendirilir.
 *
 * Not: Bu shared servistir, modules/notifications altındaki
 * NotificationsService DB operasyonlarını yapar.
 */
@Injectable()
export class SharedNotificationsService {
  private readonly logger = new Logger(SharedNotificationsService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Tek kullanıcıya bildirim gönder
   */
  async send(payload: NotificationPayload): Promise<void> {
    const channels = payload.channels || [NotificationChannel.IN_APP];

    for (const channel of channels) {
      this.eventEmitter.emit(`notification.${channel.toLowerCase()}`, payload);
    }

    this.logger.debug(
      `Bildirim gönderildi → [${payload.type}] "${payload.title}" → User: ${payload.userId} (${channels.join(', ')})`,
    );
  }

  /**
   * Birden fazla kullanıcıya aynı bildirimi gönder
   */
  async sendBulk(payload: BulkNotificationPayload): Promise<void> {
    for (const userId of payload.userIds) {
      await this.send({
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        channels: payload.channels,
        metadata: payload.metadata,
      });
    }

    this.logger.debug(
      `Toplu bildirim gönderildi → [${payload.type}] "${payload.title}" → ${payload.userIds.length} kullanıcı`,
    );
  }
}
