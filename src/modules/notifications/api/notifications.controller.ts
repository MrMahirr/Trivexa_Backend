import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from '../application/notifications.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(
        @CurrentUser() user: any,
        @Query() query: NotificationQueryDto,
    ) {
        return this.notificationsService.findByUser(user.userId, query);
    }

    @Get('unread-count')
    async getUnreadCount(@CurrentUser() user: any) {
        return this.notificationsService.countUnread(user.userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        // In a real scenario, check if notification belongs to user
        const success = await this.notificationsService.markAsRead(id);
        return { success };
    }

    @Patch('read-all')
    async markAllAsRead(@CurrentUser() user: any) {
        await this.notificationsService.markAllAsRead(user.userId);
        return { success: true };
    }
}
