import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { updatePreferencesSchema } from '@preventive-health/shared';
import { NotificationType } from '@preventive-health/database';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';

@Controller('notifications')
@UseGuards(SessionAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(
        @CurrentUser() user: AuthenticatedUser,
        @Query('unreadOnly') unreadOnly?: string,
        @Query('type') type?: NotificationType,
        @Query('limit') limit?: string
    ) {
        return this.notificationsService.getNotifications(user.id, {
            unreadOnly: unreadOnly === 'true',
            type,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get('unread-count')
    async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
        const count = await this.notificationsService.getUnreadCount(user.id);
        return { count };
    }

    @Get('preferences')
    async getPreferences(@CurrentUser() user: AuthenticatedUser) {
        return this.notificationsService.getPreferences(user.id);
    }

    @Patch('preferences')
    async updatePreferences(
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: unknown
    ) {
        const validated = updatePreferencesSchema.parse(body);
        return this.notificationsService.updatePreferences(user.id, validated);
    }

    @Get(':id')
    async getNotification(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        return this.notificationsService.getNotificationById(user.id, id);
    }

    @Patch(':id/read')
    async markAsRead(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        return this.notificationsService.markAsRead(user.id, id);
    }

    @Patch('read-all')
    async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
        return this.notificationsService.markAllAsRead(user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteNotification(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        await this.notificationsService.deleteNotification(user.id, id);
    }
}
