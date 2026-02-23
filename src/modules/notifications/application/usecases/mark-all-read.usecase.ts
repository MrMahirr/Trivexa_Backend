import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';

@Injectable()
export class MarkAllReadUseCase {
  constructor(private readonly notificationsRepo: NotificationsRepository) {}

  async execute(userId: string): Promise<void> {
    return this.notificationsRepo.markAllAsRead(userId);
  }
}
