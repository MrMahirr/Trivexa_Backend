import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsController } from './api/notifications.controller';
import { NotificationsRepository } from './infrastructure/notifications.repository';
import { CreateNotificationUseCase } from './application/usecases/create-notification.usecase';
import { NotificationService } from './application/services/notification.service';
import { MarkReadUseCase } from './application/usecases/mark-read.usecase';
import { MarkAllReadUseCase } from './application/usecases/mark-all-read.usecase';
import { NotificationsGateway } from './transport/notifications.gateway';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../../shared/email/email.module';
import { SendEmailUseCase } from './application/usecases/send-email.usecase';

@Module({
    imports: [
        DatabaseModule,
        EmailModule, // Import EmailModule
        forwardRef(() => AuthModule), // For JwtService
    ],
    controllers: [NotificationsController],
    providers: [
        NotificationsRepository,
        CreateNotificationUseCase,
        NotificationService,
        MarkReadUseCase,
        MarkAllReadUseCase,
        NotificationsGateway,
        SendEmailUseCase, // Register UseCase
    ],
    exports: [
        NotificationService,
        CreateNotificationUseCase,
        NotificationsGateway,
        SendEmailUseCase,
    ],
})
export class NotificationsModule { }
