import { Module } from '@nestjs/common';
import { NotificationsController } from './api/notifications.controller';
import { NotificationsService } from './application/notifications.service';
import { NotificationsRepository } from './infrastructure/notifications.repository';

@Module({
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsRepository],
    exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule { }
