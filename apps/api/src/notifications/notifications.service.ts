import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Notification, NotificationType } from '@preventive-health/database';
import { NotificationPreferences, UpdatePreferencesInput } from '@preventive-health/shared';

// Default notification preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
    reminders: true,
    insights: true,
    achievements: true,
    bookings: true,
    messages: true,
    system: true,
    pushEnabled: true,
    emailEnabled: false,
    quietHoursEnabled: false,
};

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Get notifications for a user
     */
    async getNotifications(
        userId: string,
        options?: { unreadOnly?: boolean; type?: NotificationType; limit?: number }
    ): Promise<Notification[]> {
        const where: any = { userId };

        if (options?.unreadOnly) {
            where.readAt = null;
        }

        if (options?.type) {
            where.type = options.type;
        }

        return this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: options?.limit || 50,
        });
    }

    /**
     * Get a single notification
     */
    async getNotificationById(userId: string, notificationId: string): Promise<Notification> {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return notification;
    }

    /**
     * Mark notification as read
     */
    async markAsRead(userId: string, notificationId: string): Promise<Notification> {
        await this.getNotificationById(userId, notificationId);

        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { readAt: new Date() },
        });
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string): Promise<{ count: number }> {
        const result = await this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });

        return { count: result.count };
    }

    /**
     * Delete a notification
     */
    async deleteNotification(userId: string, notificationId: string): Promise<void> {
        await this.getNotificationById(userId, notificationId);
        await this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: { userId, readAt: null },
        });
    }

    /**
     * Get notification preferences for a user
     * Stored in user profile metadata
     */
    async getPreferences(userId: string): Promise<NotificationPreferences> {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            return DEFAULT_PREFERENCES;
        }

        // Preferences would be stored in a separate table or profile extension
        // For now, returning defaults (can be extended with a UserPreference table)
        return DEFAULT_PREFERENCES;
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(
        userId: string,
        input: UpdatePreferencesInput
    ): Promise<NotificationPreferences> {
        // In a full implementation, this would update a separate preferences table
        // For now, we'll simulate the update
        const currentPrefs = await this.getPreferences(userId);

        return {
            ...currentPrefs,
            ...input,
        };
    }

    /**
     * Check if a notification type is enabled for a user
     */
    async isNotificationEnabled(
        userId: string,
        type: NotificationType
    ): Promise<boolean> {
        const preferences = await this.getPreferences(userId);

        switch (type) {
            case 'REMINDER':
                return preferences.reminders;
            case 'INSIGHT':
                return preferences.insights;
            case 'ACHIEVEMENT':
                return preferences.achievements;
            case 'BOOKING':
                return preferences.bookings;
            case 'MESSAGE':
                return preferences.messages;
            case 'SYSTEM':
                return preferences.system;
            default:
                return true;
        }
    }

    /**
     * Create a notification
     */
    async createNotification(
        userId: string,
        type: NotificationType,
        title: string,
        body: string,
        data?: Record<string, any>
    ): Promise<Notification | null> {
        // Check if notification type is enabled
        const isEnabled = await this.isNotificationEnabled(userId, type);
        if (!isEnabled) {
            return null;
        }

        return this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                body,
                data: data || null,
                status: 'PENDING',
            },
        });
    }
}
