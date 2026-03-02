import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../infrastructure/notifications.repository';
import { Notification } from '../domain/notification.entity';

@Injectable()
export class NotificationsPublicService {
  constructor(private readonly notificationsRepo: NotificationsRepository) {}

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepo.countUnread(userId);
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationsRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepo.markAllAsRead(userId);
  }
}
