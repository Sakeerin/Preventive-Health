import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, ReminderRule } from '@preventive-health/database';
import { CreateReminderInput, UpdateReminderInput, ScheduleConfig } from '@preventive-health/shared';

@Injectable()
export class RemindersService {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Create a new reminder rule
     */
    async createReminder(userId: string, input: CreateReminderInput): Promise<ReminderRule> {
        return this.prisma.reminderRule.create({
            data: {
                userId,
                type: input.type,
                title: input.title,
                message: input.message || null,
                schedule: input.schedule as any,
                quietHoursStart: input.quietHoursStart || null,
                quietHoursEnd: input.quietHoursEnd || null,
                isActive: true,
            },
        });
    }

    /**
     * Get all reminders for a user
     */
    async getReminders(
        userId: string,
        options?: { activeOnly?: boolean }
    ): Promise<ReminderRule[]> {
        const where: any = { userId };

        if (options?.activeOnly) {
            where.isActive = true;
        }

        return this.prisma.reminderRule.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get a single reminder by ID
     */
    async getReminderById(userId: string, reminderId: string): Promise<ReminderRule> {
        const reminder = await this.prisma.reminderRule.findFirst({
            where: { id: reminderId, userId },
        });

        if (!reminder) {
            throw new NotFoundException('Reminder not found');
        }

        return reminder;
    }

    /**
     * Update a reminder
     */
    async updateReminder(
        userId: string,
        reminderId: string,
        input: UpdateReminderInput
    ): Promise<ReminderRule> {
        await this.getReminderById(userId, reminderId);

        return this.prisma.reminderRule.update({
            where: { id: reminderId },
            data: {
                ...(input.type && { type: input.type }),
                ...(input.title && { title: input.title }),
                ...(input.message !== undefined && { message: input.message }),
                ...(input.schedule && { schedule: input.schedule as any }),
                ...(input.quietHoursStart !== undefined && { quietHoursStart: input.quietHoursStart }),
                ...(input.quietHoursEnd !== undefined && { quietHoursEnd: input.quietHoursEnd }),
                ...(input.isActive !== undefined && { isActive: input.isActive }),
            },
        });
    }

    /**
     * Delete a reminder
     */
    async deleteReminder(userId: string, reminderId: string): Promise<void> {
        await this.getReminderById(userId, reminderId);
        await this.prisma.reminderRule.delete({
            where: { id: reminderId },
        });
    }

    /**
     * Get all active reminders that are due (for scheduler)
     */
    async getDueReminders(): Promise<ReminderRule[]> {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const currentDay = now.getDay();

        const activeReminders = await this.prisma.reminderRule.findMany({
            where: { isActive: true },
            include: {
                user: {
                    include: { profile: true },
                },
            },
        });

        return activeReminders.filter((reminder: any) => {
            const schedule = reminder.schedule as ScheduleConfig;

            // Check if within quiet hours
            if (this.isInQuietHours(reminder.quietHoursStart, reminder.quietHoursEnd, currentTime)) {
                return false;
            }

            // Check schedule type
            if (schedule.type === 'daily') {
                return schedule.time === currentTime;
            }

            if (schedule.type === 'weekly') {
                const isCorrectDay = schedule.days?.includes(currentDay);
                return isCorrectDay && schedule.time === currentTime;
            }

            if (schedule.type === 'interval' && schedule.intervalMinutes) {
                // For interval-based, check if enough time has passed since last trigger
                if (!reminder.lastTriggered) {
                    return true;
                }
                const timeSinceLastTrigger = (now.getTime() - new Date(reminder.lastTriggered).getTime()) / 60000;
                return timeSinceLastTrigger >= schedule.intervalMinutes;
            }

            return false;
        });
    }

    /**
     * Mark reminder as triggered
     */
    async markTriggered(reminderId: string): Promise<void> {
        await this.prisma.reminderRule.update({
            where: { id: reminderId },
            data: { lastTriggered: new Date() },
        });
    }

    /**
     * Check if current time is within quiet hours
     */
    private isInQuietHours(
        quietHoursStart: string | null,
        quietHoursEnd: string | null,
        currentTime: string
    ): boolean {
        if (!quietHoursStart || !quietHoursEnd) {
            return false;
        }

        // Convert times to minutes for easier comparison
        const toMinutes = (time: string): number => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const current = toMinutes(currentTime);
        const start = toMinutes(quietHoursStart);
        const end = toMinutes(quietHoursEnd);

        // Handle overnight quiet hours (e.g., 22:00 - 07:00)
        if (start > end) {
            return current >= start || current <= end;
        }

        return current >= start && current <= end;
    }
}
