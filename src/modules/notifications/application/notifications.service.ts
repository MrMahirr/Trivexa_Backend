import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../infrastructure/notifications.repository';
import { Notification } from '../domain/notification.entity';
import { CreateNotificationDto } from '../api/dto/create-notification.dto';
import { NotificationQueryDto } from '../api/dto/notification-query.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsRepository.create(dto);
  }

  async findByUser(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<Notification[]> {
    return this.notificationsRepository.findByUser(userId, query);
  }

  async markAsRead(id: string): Promise<boolean> {
    return this.notificationsRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.notificationsRepository.markAllAsRead(userId);
  }

  async countUnread(userId: string): Promise<{ count: number }> {
    const count = await this.notificationsRepository.countUnread(userId);
    return { count };
  }
}
