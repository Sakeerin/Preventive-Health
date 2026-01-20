import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from '@preventive-health/database';
import { NotificationsService } from '../notifications/notifications.service';

interface WeeklySummaryData {
    totalSteps: number;
    avgSteps: number;
    stepsChange: number;
    totalSleepMinutes: number;
    avgSleepMinutes: number;
    sleepChange: number;
    totalWorkouts: number;
    workoutsChange: number;
    goalsCompleted: number;
    goalsTotal: number;
}

@Injectable()
export class WeeklySummaryService {
    private readonly logger = new Logger(WeeklySummaryService.name);

    constructor(
        private readonly prisma: PrismaClient,
        private readonly notificationsService: NotificationsService
    ) { }

    /**
     * Generate weekly summaries every Monday at 9:00 AM
     */
    @Cron('0 9 * * 1') // Every Monday at 9:00 AM
    async generateWeeklySummaries(): Promise<void> {
        this.logger.log('Starting weekly summary generation');

        try {
            // Get all active users
            const users = await this.prisma.user.findMany({
                where: { isActive: true },
                select: { id: true },
            });

            for (const user of users) {
                try {
                    await this.generateUserWeeklySummary(user.id);
                } catch (error) {
                    this.logger.error(`Failed to generate summary for user ${user.id}:`, error);
                }
            }

            this.logger.log(`Generated summaries for ${users.length} users`);
        } catch (error) {
            this.logger.error('Failed to generate weekly summaries:', error);
        }
    }

    /**
     * Generate weekly summary for a single user
     */
    async generateUserWeeklySummary(userId: string): Promise<WeeklySummaryData> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Last 7 days
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);

        // Previous week (for comparison)
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        // Get this week's data
        const thisWeekData = await this.prisma.dailyAggregate.findMany({
            where: {
                userId,
                date: { gte: thisWeekStart, lt: today },
            },
        });

        // Get last week's data
        const lastWeekData = await this.prisma.dailyAggregate.findMany({
            where: {
                userId,
                date: { gte: lastWeekStart, lt: thisWeekStart },
            },
        });

        // Calculate this week metrics
        const totalSteps = thisWeekData.reduce((sum, d) => sum + d.steps, 0);
        const avgSteps = Math.round(totalSteps / Math.max(thisWeekData.length, 1));
        const totalSleepMinutes = thisWeekData.reduce((sum, d) => sum + d.sleepDuration, 0);
        const avgSleepMinutes = Math.round(totalSleepMinutes / Math.max(thisWeekData.length, 1));
        const totalWorkouts = thisWeekData.reduce((sum, d) => sum + d.workoutCount, 0);

        // Calculate last week metrics
        const lastWeekSteps = lastWeekData.reduce((sum, d) => sum + d.steps, 0);
        const lastWeekAvgSteps = Math.round(lastWeekSteps / Math.max(lastWeekData.length, 1));
        const lastWeekSleep = lastWeekData.reduce((sum, d) => sum + d.sleepDuration, 0);
        const lastWeekAvgSleep = Math.round(lastWeekSleep / Math.max(lastWeekData.length, 1));
        const lastWeekWorkouts = lastWeekData.reduce((sum, d) => sum + d.workoutCount, 0);

        // Calculate changes
        const stepsChange = lastWeekAvgSteps > 0
            ? Math.round(((avgSteps - lastWeekAvgSteps) / lastWeekAvgSteps) * 100)
            : 0;
        const sleepChange = lastWeekAvgSleep > 0
            ? Math.round(((avgSleepMinutes - lastWeekAvgSleep) / lastWeekAvgSleep) * 100)
            : 0;
        const workoutsChange = lastWeekWorkouts > 0
            ? Math.round(((totalWorkouts - lastWeekWorkouts) / lastWeekWorkouts) * 100)
            : 0;

        // Get goal completion stats
        const goals = await this.prisma.goal.findMany({
            where: { userId, isActive: true },
        });

        // Simplified goal completion check
        const goalsTotal = goals.length;
        const goalsCompleted = 0; // Would need more complex calculation

        const summaryData: WeeklySummaryData = {
            totalSteps,
            avgSteps,
            stepsChange,
            totalSleepMinutes,
            avgSleepMinutes,
            sleepChange,
            totalWorkouts,
            workoutsChange,
            goalsCompleted,
            goalsTotal,
        };

        // Create insight for this summary
        await this.createSummaryInsight(userId, summaryData);

        // Create notification
        await this.notificationsService.createNotification(
            userId,
            'INSIGHT',
            'Weekly Health Summary',
            this.generateSummaryMessage(summaryData),
            { type: 'weekly_summary', data: summaryData }
        );

        return summaryData;
    }

    /**
     * Create an insight record for the weekly summary
     */
    private async createSummaryInsight(userId: string, data: WeeklySummaryData): Promise<void> {
        const isImproving = data.stepsChange > 0 || data.sleepChange > 0 || data.workoutsChange > 0;

        await this.prisma.insight.create({
            data: {
                userId,
                type: 'TREND',
                title: 'Weekly Health Summary',
                description: this.generateSummaryMessage(data),
                priority: isImproving ? 'LOW' : 'MEDIUM',
                actionable: true,
                actionType: 'VIEW_DASHBOARD',
                actionTarget: '/dashboard',
            },
        });
    }

    /**
     * Generate human-readable summary message
     */
    private generateSummaryMessage(data: WeeklySummaryData): string {
        const parts: string[] = [];

        // Steps summary
        if (data.avgSteps > 0) {
            const stepsEmoji = data.stepsChange >= 0 ? '📈' : '📉';
            const stepsChange = data.stepsChange >= 0 ? `+${data.stepsChange}%` : `${data.stepsChange}%`;
            parts.push(`${stepsEmoji} Averaged ${data.avgSteps.toLocaleString()} steps/day (${stepsChange} vs last week)`);
        }

        // Sleep summary
        if (data.avgSleepMinutes > 0) {
            const sleepHours = (data.avgSleepMinutes / 60).toFixed(1);
            const sleepEmoji = data.sleepChange >= 0 ? '😴' : '😩';
            parts.push(`${sleepEmoji} Averaged ${sleepHours} hours of sleep per night`);
        }

        // Workout summary
        parts.push(`💪 Completed ${data.totalWorkouts} workouts`);

        return parts.join('\n');
    }
}
