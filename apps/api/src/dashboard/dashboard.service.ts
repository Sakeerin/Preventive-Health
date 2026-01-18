import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient, MetricType } from '@preventive-health/database';

interface TrendData {
    date: string;
    value: number;
}

interface DashboardSummary {
    today: DailyMetrics;
    weeklyTrend: TrendData[];
    monthlyTrend: TrendData[];
    goals: GoalProgress[];
    insights: InsightSummary[];
}

interface DailyMetrics {
    steps: number;
    activeEnergy: number;
    sleepDuration: number;
    averageHeartRate: number | null;
    restingHeartRate: number | null;
    workoutCount: number;
    workoutDuration: number;
    waterIntake: number;
}

interface GoalProgress {
    id: string;
    type: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    progress: number; // 0-100
}

interface InsightSummary {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
}

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Get dashboard summary for a user
     */
    async getDashboardSummary(userId: string): Promise<DashboardSummary> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todayMetrics, weeklyTrend, monthlyTrend, goals, insights] =
            await Promise.all([
                this.getTodayMetrics(userId, today),
                this.getWeeklyTrend(userId, today),
                this.getMonthlyTrend(userId, today),
                this.getGoalProgress(userId),
                this.getRecentInsights(userId),
            ]);

        return {
            today: todayMetrics,
            weeklyTrend,
            monthlyTrend,
            goals,
            insights,
        };
    }

    /**
     * Get today's metrics
     */
    private async getTodayMetrics(userId: string, today: Date): Promise<DailyMetrics> {
        const aggregate = await this.prisma.dailyAggregate.findUnique({
            where: {
                userId_date: { userId, date: today },
            },
        });

        // Get water intake from measurements
        const waterMeasurements = await this.prisma.measurement.findMany({
            where: {
                userId,
                type: 'WATER_INTAKE',
                recordedAt: { gte: today },
            },
        });

        const waterIntake = waterMeasurements.reduce((sum, m) => sum + m.value, 0);

        return {
            steps: aggregate?.steps ?? 0,
            activeEnergy: aggregate?.activeEnergy ?? 0,
            sleepDuration: aggregate?.sleepDuration ?? 0,
            averageHeartRate: aggregate?.averageHeartRate ?? null,
            restingHeartRate: aggregate?.restingHeartRate ?? null,
            workoutCount: aggregate?.workoutCount ?? 0,
            workoutDuration: aggregate?.workoutDuration ?? 0,
            waterIntake,
        };
    }

    /**
     * Get 7-day trend data
     */
    private async getWeeklyTrend(userId: string, today: Date): Promise<TrendData[]> {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const aggregates = await this.prisma.dailyAggregate.findMany({
            where: {
                userId,
                date: { gte: sevenDaysAgo, lte: today },
            },
            orderBy: { date: 'asc' },
        });

        // Fill in missing dates with zeros
        const trend: TrendData[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const aggregate = aggregates.find(
                (a) => a.date.toISOString().split('T')[0] === dateStr
            );

            trend.push({
                date: dateStr,
                value: aggregate?.steps ?? 0,
            });
        }

        return trend;
    }

    /**
     * Get 30-day trend data
     */
    private async getMonthlyTrend(userId: string, today: Date): Promise<TrendData[]> {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const aggregates = await this.prisma.dailyAggregate.findMany({
            where: {
                userId,
                date: { gte: thirtyDaysAgo, lte: today },
            },
            orderBy: { date: 'asc' },
        });

        // Group by week and average
        const weeklyData: Record<string, number[]> = {};
        aggregates.forEach((a) => {
            const weekStart = getWeekStart(a.date);
            if (!weeklyData[weekStart]) {
                weeklyData[weekStart] = [];
            }
            weeklyData[weekStart].push(a.steps);
        });

        return Object.entries(weeklyData).map(([week, values]) => ({
            date: week,
            value: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        }));
    }

    /**
     * Get goal progress
     */
    private async getGoalProgress(userId: string): Promise<GoalProgress[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const goals = await this.prisma.goal.findMany({
            where: {
                userId,
                isActive: true,
                OR: [
                    { endDate: null },
                    { endDate: { gte: today } },
                ],
            },
        });

        const todayAggregate = await this.prisma.dailyAggregate.findUnique({
            where: { userId_date: { userId, date: today } },
        });

        return goals.map((goal) => {
            let currentValue = 0;

            // Map goal type to aggregate field
            switch (goal.type) {
                case 'STEPS':
                    currentValue = todayAggregate?.steps ?? 0;
                    break;
                case 'ACTIVE_ENERGY':
                    currentValue = todayAggregate?.activeEnergy ?? 0;
                    break;
                case 'SLEEP_DURATION':
                    currentValue = todayAggregate?.sleepDuration ?? 0;
                    break;
                case 'WORKOUT_DURATION':
                    currentValue = todayAggregate?.workoutDuration ?? 0;
                    break;
                case 'WORKOUT_COUNT':
                    currentValue = todayAggregate?.workoutCount ?? 0;
                    break;
            }

            const progress = Math.min(
                100,
                Math.round((currentValue / goal.targetValue) * 100)
            );

            return {
                id: goal.id,
                type: goal.type,
                targetValue: goal.targetValue,
                currentValue,
                unit: goal.unit,
                progress,
            };
        });
    }

    /**
     * Get recent insights
     */
    private async getRecentInsights(userId: string): Promise<InsightSummary[]> {
        const insights = await this.prisma.insight.findMany({
            where: {
                userId,
                isRead: false,
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 5,
        });

        return insights.map((i) => ({
            id: i.id,
            type: i.type,
            title: i.title,
            description: i.description,
            priority: i.priority,
        }));
    }

    /**
     * Compute daily aggregates for a user (called by cron or on-demand)
     */
    async computeDailyAggregate(userId: string, date: Date): Promise<void> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all measurements for the day
        const measurements = await this.prisma.measurement.findMany({
            where: {
                userId,
                recordedAt: { gte: startOfDay, lte: endOfDay },
            },
        });

        // Get sleep sessions
        const sleepSessions = await this.prisma.sleepSession.findMany({
            where: {
                userId,
                startTime: {
                    gte: new Date(startOfDay.getTime() - 12 * 60 * 60 * 1000),
                    lte: endOfDay,
                },
            },
        });

        // Get workouts
        const workouts = await this.prisma.workoutSession.findMany({
            where: {
                userId,
                startTime: { gte: startOfDay, lte: endOfDay },
            },
        });

        // Calculate aggregates
        const steps = sumByType(measurements, 'STEPS');
        const activeEnergy = sumByType(measurements, 'ACTIVE_ENERGY');
        const sleepDuration = sleepSessions.reduce((sum, s) => sum + s.duration, 0);

        const heartRates = measurements
            .filter((m) => m.type === 'HEART_RATE')
            .map((m) => m.value);
        const averageHeartRate =
            heartRates.length > 0
                ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length
                : null;

        const restingHRs = measurements
            .filter((m) => m.type === 'RESTING_HEART_RATE')
            .map((m) => m.value);
        const restingHeartRate =
            restingHRs.length > 0 ? Math.min(...restingHRs) : null;

        // Upsert daily aggregate
        await this.prisma.dailyAggregate.upsert({
            where: { userId_date: { userId, date: startOfDay } },
            update: {
                steps: Math.round(steps),
                activeEnergy,
                sleepDuration,
                averageHeartRate,
                restingHeartRate,
                workoutCount: workouts.length,
                workoutDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
            },
            create: {
                userId,
                date: startOfDay,
                steps: Math.round(steps),
                activeEnergy,
                sleepDuration,
                averageHeartRate,
                restingHeartRate,
                workoutCount: workouts.length,
                workoutDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
            },
        });
    }

    /**
     * Cron job to compute daily aggregates for all active users
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async computeAllDailyAggregates(): Promise<void> {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // Get all users with recent activity
        const users = await this.prisma.user.findMany({
            where: {
                measurements: {
                    some: {
                        recordedAt: { gte: yesterday },
                    },
                },
            },
            select: { id: true },
        });

        for (const user of users) {
            try {
                await this.computeDailyAggregate(user.id, yesterday);
            } catch (error) {
                console.error(`Failed to compute aggregate for user ${user.id}:`, error);
            }
        }
    }
}

// Helper functions
function getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}

function sumByType(
    measurements: { type: MetricType; value: number }[],
    type: MetricType
): number {
    return measurements
        .filter((m) => m.type === type)
        .reduce((sum, m) => sum + m.value, 0);
}
