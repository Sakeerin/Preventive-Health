import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, GoalType, Frequency, Goal } from '@preventive-health/database';
import { CreateGoalInput, UpdateGoalInput, GoalProgress } from '@preventive-health/shared';

@Injectable()
export class GoalsService {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Create a new goal
     */
    async createGoal(userId: string, input: CreateGoalInput): Promise<Goal> {
        const startDate = input.startDate || new Date();
        startDate.setHours(0, 0, 0, 0);

        if (input.endDate && input.endDate < startDate) {
            throw new BadRequestException('endDate must be greater than or equal to startDate');
        }

        // Check for duplicate active goal of same type
        const existingGoal = await this.prisma.goal.findFirst({
            where: {
                userId,
                type: input.type as GoalType,
                isActive: true,
                OR: [
                    { endDate: null },
                    { endDate: { gte: new Date() } },
                ],
            },
        });

        if (existingGoal) {
            throw new BadRequestException(
                `An active goal of type ${input.type} already exists. Please update or delete the existing goal first.`
            );
        }

        return this.prisma.goal.create({
            data: {
                userId,
                type: input.type as GoalType,
                targetValue: input.targetValue,
                unit: input.unit,
                frequency: input.frequency as Frequency,
                startDate,
                endDate: input.endDate || null,
                isActive: true,
            },
        });
    }

    /**
     * Get all goals for a user
     */
    async getGoals(
        userId: string,
        options?: { activeOnly?: boolean; type?: GoalType }
    ): Promise<Goal[]> {
        const where: any = { userId };

        if (options?.activeOnly) {
            where.isActive = true;
            where.OR = [
                { endDate: null },
                { endDate: { gte: new Date() } },
            ];
        }

        if (options?.type) {
            where.type = options.type;
        }

        return this.prisma.goal.findMany({
            where,
            orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
        });
    }

    /**
     * Get a single goal by ID
     */
    async getGoalById(userId: string, goalId: string): Promise<Goal> {
        const goal = await this.prisma.goal.findFirst({
            where: { id: goalId, userId },
        });

        if (!goal) {
            throw new NotFoundException('Goal not found');
        }

        return goal;
    }

    /**
     * Update a goal
     */
    async updateGoal(
        userId: string,
        goalId: string,
        input: UpdateGoalInput
    ): Promise<Goal> {
        await this.getGoalById(userId, goalId);

        if (input.startDate && input.endDate && input.endDate < input.startDate) {
            throw new BadRequestException('endDate must be greater than or equal to startDate');
        }

        return this.prisma.goal.update({
            where: { id: goalId },
            data: {
                ...(input.type && { type: input.type as GoalType }),
                ...(input.targetValue !== undefined && { targetValue: input.targetValue }),
                ...(input.unit && { unit: input.unit }),
                ...(input.frequency && { frequency: input.frequency as Frequency }),
                ...(input.startDate && { startDate: input.startDate }),
                ...(input.endDate !== undefined && { endDate: input.endDate }),
                ...(input.isActive !== undefined && { isActive: input.isActive }),
            },
        });
    }

    /**
     * Delete (deactivate) a goal
     */
    async deleteGoal(userId: string, goalId: string): Promise<Goal> {
        await this.getGoalById(userId, goalId);

        return this.prisma.goal.update({
            where: { id: goalId },
            data: { isActive: false },
        });
    }

    /**
     * Get goal progress with current values
     */
    async getGoalProgress(userId: string): Promise<GoalProgress[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get active goals
        const goals = await this.getGoals(userId, { activeOnly: true });

        // Get today's aggregate
        const todayAggregate = await this.prisma.dailyAggregate.findUnique({
            where: { userId_date: { userId, date: today } },
        });

        // Get weekly/monthly aggregates if needed
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const weeklyAggregates = await this.prisma.dailyAggregate.findMany({
            where: {
                userId,
                date: { gte: weekStart, lte: today },
            },
        });

        const monthlyAggregates = await this.prisma.dailyAggregate.findMany({
            where: {
                userId,
                date: { gte: monthStart, lte: today },
            },
        });

        // Get water intake from measurements for today
        const waterMeasurements = await this.prisma.measurement.findMany({
            where: {
                userId,
                type: 'WATER_INTAKE',
                recordedAt: { gte: monthStart },
            },
        });
        const weightMeasurements = await this.prisma.measurement.findMany({
            where: {
                userId,
                type: 'WEIGHT',
                recordedAt: { gte: monthStart },
            },
            orderBy: { recordedAt: 'desc' },
        });

        const dailyWaterIntake = sumMeasurementsWithinRange(waterMeasurements, today, today);
        const weeklyWaterIntake = sumMeasurementsWithinRange(waterMeasurements, weekStart, today);
        const monthlyWaterIntake = sumMeasurementsWithinRange(waterMeasurements, monthStart, today);

        return goals.map((goal) => {
            let currentValue = 0;
            const aggregates =
                goal.frequency === 'DAILY' ? [todayAggregate].filter(isAggregate) :
                    goal.frequency === 'WEEKLY' ? weeklyAggregates :
                        monthlyAggregates;

            switch (goal.type) {
                case 'STEPS':
                    currentValue = aggregates.reduce((sum, aggregate) => sum + aggregate.steps, 0);
                    break;
                case 'ACTIVE_ENERGY':
                    currentValue = aggregates.reduce(
                        (sum, aggregate) => sum + aggregate.activeEnergy,
                        0
                    );
                    break;
                case 'SLEEP_DURATION':
                    currentValue = aggregates.reduce(
                        (sum, aggregate) => sum + aggregate.sleepDuration,
                        0
                    );
                    if (goal.frequency !== 'DAILY') {
                        currentValue = currentValue / Math.max(aggregates.length, 1); // Average for weekly/monthly
                    }
                    break;
                case 'WATER_INTAKE':
                    currentValue =
                        goal.frequency === 'DAILY'
                            ? dailyWaterIntake
                            : goal.frequency === 'WEEKLY'
                                ? weeklyWaterIntake
                                : monthlyWaterIntake;
                    break;
                case 'WORKOUT_COUNT':
                    currentValue = aggregates.reduce(
                        (sum, aggregate) => sum + aggregate.workoutCount,
                        0
                    );
                    break;
                case 'WEIGHT':
                    currentValue = getLatestWeightValue(weightMeasurements, goal.frequency, {
                        today,
                        weekStart,
                        monthStart,
                    });
                    break;
            }

            const progress = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));

            return {
                id: goal.id,
                type: goal.type as any,
                targetValue: goal.targetValue,
                currentValue,
                unit: goal.unit,
                frequency: goal.frequency as any,
                progress,
                isCompleted: progress >= 100,
            };
        });
    }
}

function isAggregate<T>(value: T | null): value is T {
    return value !== null;
}

function sumMeasurementsWithinRange(
    measurements: Array<{ recordedAt: Date; value: number }>,
    startDate: Date,
    endDate: Date
): number {
    const rangeStart = new Date(startDate);
    rangeStart.setHours(0, 0, 0, 0);

    const rangeEnd = new Date(endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    return measurements
        .filter(
            (measurement) =>
                measurement.recordedAt >= rangeStart && measurement.recordedAt <= rangeEnd
        )
        .reduce((sum, measurement) => sum + measurement.value, 0);
}

function getLatestWeightValue(
    measurements: Array<{ recordedAt: Date; value: number }>,
    frequency: Frequency,
    dates: { today: Date; weekStart: Date; monthStart: Date }
): number {
    const rangeStart =
        frequency === 'DAILY'
            ? dates.today
            : frequency === 'WEEKLY'
                ? dates.weekStart
                : dates.monthStart;

    const rangeStartAtMidnight = new Date(rangeStart);
    rangeStartAtMidnight.setHours(0, 0, 0, 0);

    const match = measurements.find(
        (measurement) => measurement.recordedAt >= rangeStartAtMidnight
    );

    return match?.value ?? 0;
}
