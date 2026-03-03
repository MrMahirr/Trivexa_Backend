import { Injectable, Logger } from '@nestjs/common';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';
import { Notification } from '../../domain/notification.entity';
import { NotificationsGateway } from '../../transport/notifications.gateway';

@Injectable()
export class CreateNotificationUseCase {
  private readonly logger = new Logger(CreateNotificationUseCase.name);

  constructor(
    private readonly notificationsRepo: NotificationsRepository,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async execute(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    // 1. Save to DB
    const notification = await this.notificationsRepo.create(data);

    // 2. Send Real-Time Notification
    try {
      this.notificationsGateway.notifyUser(data.userId, notification);
    } catch (error) {
      this.logger.error(
        `Failed to send real-time notification to user ${data.userId}: ${error.message}`,
      );
    }

    return notification;
  }
}
