import { Module } from '@nestjs/common';
import { NotificationsController } from './api/notifications.controller';
import { NotificationsRepository } from './infrastructure/notifications.repository';
import { CreateNotificationUseCase } from './application/usecases/create-notification.usecase';
import { NotificationService } from './application/services/notification.service';
import { MarkReadUseCase } from './application/usecases/mark-read.usecase';
import { MarkAllReadUseCase } from './application/usecases/mark-all-read.usecase';

@Module({
    controllers: [NotificationsController],
    providers: [
        NotificationsRepository,
        CreateNotificationUseCase,
        NotificationService,
        MarkReadUseCase,
        MarkAllReadUseCase,
    ],
    exports: [NotificationService],
})
export class NotificationsModule { }
