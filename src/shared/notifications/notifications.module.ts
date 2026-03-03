import { Module, Global } from '@nestjs/common';
import { SharedNotificationsService } from './notifications.service';
import { NotificationFactory } from './notifications.factory';

/**
 * SharedNotificationsModule — Merkezi bildirim modülü.
 * Global olarak tüm uygulamadan erişilebilir.
 *
 * SharedNotificationsService → Bildirim gönderme
 * NotificationFactory → Standart bildirim payload'ları oluşturma
 */
@Global()
@Module({
  providers: [SharedNotificationsService, NotificationFactory],
  exports: [SharedNotificationsService, NotificationFactory],
})
export class SharedNotificationsModule {}
