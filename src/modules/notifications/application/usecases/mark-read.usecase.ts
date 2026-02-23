import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';

@Injectable()
export class MarkReadUseCase {
  constructor(private readonly notificationsRepo: NotificationsRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.notificationsRepo.markAsRead(id);
  }
}
