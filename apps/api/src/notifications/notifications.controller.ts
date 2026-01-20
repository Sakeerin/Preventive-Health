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
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { updatePreferencesSchema } from '@preventive-health/shared';
import { NotificationType } from '@preventive-health/database';

// TODO: Replace with actual auth decorator
const MOCK_USER_ID = 'mock-user-id';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(
        @Query('unreadOnly') unreadOnly?: string,
        @Query('type') type?: NotificationType,
        @Query('limit') limit?: string
    ) {
        return this.notificationsService.getNotifications(MOCK_USER_ID, {
            unreadOnly: unreadOnly === 'true',
            type,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get('unread-count')
    async getUnreadCount() {
        const count = await this.notificationsService.getUnreadCount(MOCK_USER_ID);
        return { count };
    }

    @Get('preferences')
    async getPreferences() {
        return this.notificationsService.getPreferences(MOCK_USER_ID);
    }

    @Patch('preferences')
    async updatePreferences(@Body() body: unknown) {
        const validated = updatePreferencesSchema.parse(body);
        return this.notificationsService.updatePreferences(MOCK_USER_ID, validated);
    }

    @Get(':id')
    async getNotification(@Param('id') id: string) {
        return this.notificationsService.getNotificationById(MOCK_USER_ID, id);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(MOCK_USER_ID, id);
    }

    @Patch('read-all')
    async markAllAsRead() {
        return this.notificationsService.markAllAsRead(MOCK_USER_ID);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteNotification(@Param('id') id: string) {
        await this.notificationsService.deleteNotification(MOCK_USER_ID, id);
    }
}
