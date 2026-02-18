import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';
import { Notification } from '../../domain/notification.entity';

@Injectable()
export class CreateNotificationUseCase {
    constructor(private readonly notificationsRepo: NotificationsRepository) { }

    async execute(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        metadata?: Record<string, any>;
    }): Promise<Notification> {
        return this.notificationsRepo.create(data);
    }
}
