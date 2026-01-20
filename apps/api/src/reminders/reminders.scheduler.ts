import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient, NotificationType, NotificationStatus } from '@preventive-health/database';
import { RemindersService } from './reminders.service';

@Injectable()
export class RemindersScheduler {
    private readonly logger = new Logger(RemindersScheduler.name);

    constructor(
        private readonly prisma: PrismaClient,
        private readonly remindersService: RemindersService
    ) { }

    /**
     * Process due reminders every minute
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async processReminders(): Promise<void> {
        try {
            const dueReminders = await this.remindersService.getDueReminders();

            this.logger.log(`Processing ${dueReminders.length} due reminders`);

            for (const reminder of dueReminders) {
                try {
                    // Create notification for the reminder
                    await this.prisma.notification.create({
                        data: {
                            userId: reminder.userId,
                            type: 'REMINDER' as NotificationType,
                            title: reminder.title,
                            body: reminder.message || this.getDefaultMessage(reminder.type),
                            data: { reminderId: reminder.id, reminderType: reminder.type },
                            status: 'PENDING' as NotificationStatus,
                        },
                    });

                    // Mark reminder as triggered
                    await this.remindersService.markTriggered(reminder.id);

                    this.logger.log(`Created notification for reminder ${reminder.id}`);
                } catch (error) {
                    this.logger.error(`Failed to process reminder ${reminder.id}:`, error);
                }
            }
        } catch (error) {
            this.logger.error('Failed to process reminders:', error);
        }
    }

    /**
     * Get default message for reminder type
     */
    private getDefaultMessage(type: string): string {
        const messages: Record<string, string> = {
            HYDRATION: "Time to drink some water! Stay hydrated for better health.",
            MOVEMENT: "Time to move! Take a short walk or stretch.",
            SLEEP: "It's getting late. Consider winding down for better sleep.",
            MEDICATION: "Don't forget to take your medication.",
            WORKOUT: "Time for your workout! Stay active and healthy.",
            CUSTOM: "You have a reminder.",
        };

        return messages[type] || messages.CUSTOM;
    }

    /**
     * Send pending notifications (placeholder for push notification integration)
     */
    @Cron(CronExpression.EVERY_10_SECONDS)
    async sendPendingNotifications(): Promise<void> {
        const pendingNotifications = await this.prisma.notification.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    include: {
                        devices: {
                            where: { pushToken: { not: null } },
                        },
                    },
                },
            },
            take: 100, // Process in batches
        });

        for (const notification of pendingNotifications) {
            try {
                // TODO: Integrate with Expo Push Notifications or FCM
                // For now, just mark as sent
                const hasPushToken = notification.user.devices.length > 0;

                await this.prisma.notification.update({
                    where: { id: notification.id },
                    data: {
                        status: hasPushToken ? 'SENT' : 'DELIVERED',
                        sentAt: new Date(),
                    },
                });

                if (hasPushToken) {
                    // Send to each device
                    for (const device of notification.user.devices) {
                        await this.sendPushNotification(device.pushToken!, {
                            title: notification.title,
                            body: notification.body,
                            data: notification.data as Record<string, any>,
                        });
                    }
                }
            } catch (error) {
                this.logger.error(`Failed to send notification ${notification.id}:`, error);
                await this.prisma.notification.update({
                    where: { id: notification.id },
                    data: { status: 'FAILED' },
                });
            }
        }
    }

    /**
     * Send push notification (placeholder implementation)
     */
    private async sendPushNotification(
        pushToken: string,
        payload: { title: string; body: string; data?: Record<string, any> }
    ): Promise<void> {
        // TODO: Implement actual push notification sending
        // Using Expo Push Notifications:
        // const response = await fetch('https://exp.host/--/api/v2/push/send', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         to: pushToken,
        //         title: payload.title,
        //         body: payload.body,
        //         data: payload.data,
        //     }),
        // });

        this.logger.log(`Would send push to ${pushToken}: ${payload.title}`);
    }
}
