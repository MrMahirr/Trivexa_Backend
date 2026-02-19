import { Controller, Get, Param, Patch, Query, UseGuards, Post, Body } from '@nestjs/common';
import { NotificationsRepository } from '../infrastructure/notifications.repository';
import { MarkReadUseCase } from '../application/usecases/mark-read.usecase';
import { MarkAllReadUseCase } from '../application/usecases/mark-all-read.usecase';
import { SendEmailUseCase } from '../application/usecases/send-email.usecase';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(
        private readonly notificationsRepo: NotificationsRepository,
        private readonly markReadUseCase: MarkReadUseCase,
        private readonly markAllReadUseCase: MarkAllReadUseCase,
        private readonly sendEmailUseCase: SendEmailUseCase,
    ) { }

    @Post('email')
    async sendEmail(@Body() dto: SendEmailDto) {
        await this.sendEmailUseCase.execute(dto.to, dto.subject, dto.content, dto.isHtml);
        return { success: true, message: 'Email queued/sent' };
    }

    @Get()
    async getNotifications(
        @CurrentUser() user: any,
        @Query() query: NotificationQueryDto,
    ) {
        return this.notificationsRepo.findByUser(user.userId, query);
    }

    @Get('unread-count')
    async getUnreadCount(@CurrentUser() user: any) {
        return this.notificationsRepo.countUnread(user.userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        // In a real scenario, check if notification belongs to user
        const success = await this.markReadUseCase.execute(id);
        return { success };
    }

    @Patch('read-all')
    async markAllAsRead(@CurrentUser() user: any) {
        await this.markAllReadUseCase.execute(user.userId);
        return { success: true };
    }
}
