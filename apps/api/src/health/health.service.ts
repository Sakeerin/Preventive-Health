import { createHash } from 'crypto';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaClient, MetricType } from '@preventive-health/database';

interface MeasurementInput {
    type: string;
    value: number;
    unit: string;
    recordedAt: string;
    source: string;
    sourceId?: string;
    metadata?: Record<string, unknown>;
}

interface IdempotencyRecord {
    count: number;
    createdAt: Date;
}

const IDEMPOTENCY_RESOURCE = 'HealthMeasurements';
const IDEMPOTENCY_ACTION = 'IDEMPOTENCY_KEY';
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);

    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Check if a request with this idempotency key was already processed
     */
    async checkIdempotency( 
        userId: string,
        key: string
    ): Promise<IdempotencyRecord | null> {
        const idempotencyEntry = await this.prisma.auditLog.findFirst({
            where: {
                userId,
                action: IDEMPOTENCY_ACTION,
                resource: IDEMPOTENCY_RESOURCE,
                resourceId: this.hashIdempotencyKey(userId, key),
                createdAt: {
                    gte: new Date(Date.now() - IDEMPOTENCY_TTL_MS),
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!idempotencyEntry) {
            return null;
        }

        const details = idempotencyEntry.details as { count?: number } | null;
        return {
            count: details?.count ?? 0,
            createdAt: idempotencyEntry.createdAt,
        };
    }

    /**
     * Create multiple measurements with deduplication
     */
    async createMeasurements(
        userId: string,
        measurements: MeasurementInput[],
        idempotencyKey?: string
    ): Promise<{ count: number }> {
        let createdCount = 0;

        for (const m of measurements) {
            try {
                // Use upsert for idempotency based on unique constraint
                await this.prisma.measurement.upsert({
                    where: {
                        userId_type_recordedAt_sourceId: {
                            userId,
                            type: this.mapMetricType(m.type),
                            recordedAt: new Date(m.recordedAt),
                            sourceId: m.sourceId ?? '',
                        },
                    },
                    update: {
                        value: m.value,
                        unit: m.unit,
                        metadata: m.metadata as any,
                    },
                    create: {
                        userId,
                        type: this.mapMetricType(m.type),
                        value: m.value,
                        unit: m.unit,
                        recordedAt: new Date(m.recordedAt),
                        sourceId: m.sourceId ?? '',
                        metadata: m.metadata as any,
                    },
                });
                createdCount++;
            } catch (error) {
                this.logger.error('Failed to create measurement:', error);
            }
        }

        if (idempotencyKey) {
            await this.prisma.auditLog.create({
                data: {
                    userId,
                    action: IDEMPOTENCY_ACTION,
                    resource: IDEMPOTENCY_RESOURCE,
                    resourceId: this.hashIdempotencyKey(userId, idempotencyKey),
                    details: { count: createdCount } as any,
                    status: 'success',
                },
            });
        }

        return { count: createdCount };
    }

    /**
     * Get daily aggregates for a user
     */
    async getDailyAggregates(
        userId: string,
        startDate: Date,
        endDate?: Date
    ) {
        const end = endDate ?? new Date();

        return this.prisma.dailyAggregate.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: end,
                },
            },
            orderBy: { date: 'desc' },
        });
    }

    /**
     * Get measurements for a user
     */
    async getMeasurements(
        userId: string,
        type: string,
        startDate: Date,
        endDate?: Date,
        limit?: number
    ) {
        const end = endDate ?? new Date();

        return this.prisma.measurement.findMany({
            where: {
                userId,
                type: this.mapMetricType(type),
                recordedAt: {
                    gte: startDate,
                    lte: end,
                },
            },
            orderBy: { recordedAt: 'desc' },
            take: limit ?? 100,
        });
    }

    /**
     * Compute daily aggregate from measurements
     */
    async computeDailyAggregate(userId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all measurements for the day
        const measurements = await this.prisma.measurement.findMany({
            where: {
                userId,
                recordedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        // Get sleep sessions for the night before
        const sleepSessions = await this.prisma.sleepSession.findMany({
            where: {
                userId,
                startTime: {
                    gte: new Date(startOfDay.getTime() - 12 * 60 * 60 * 1000), // 12 hours before
                    lte: endOfDay,
                },
            },
        });

        // Get workouts for the day
        const workouts = await this.prisma.workoutSession.findMany({
            where: {
                userId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        // Calculate aggregates
        const steps = this.sumByType(measurements, 'STEPS');
        const activeEnergy = this.sumByType(measurements, 'ACTIVE_ENERGY');
        const sleepDuration = sleepSessions.reduce((sum, s) => sum + s.duration, 0);
        const heartRates = measurements
            .filter((m) => m.type === 'HEART_RATE')
            .map((m) => m.value);
        const averageHeartRate =
            heartRates.length > 0
                ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length
                : null;
        const restingHeartRates = measurements
            .filter((m) => m.type === 'RESTING_HEART_RATE')
            .map((m) => m.value);
        const restingHeartRate =
            restingHeartRates.length > 0
                ? Math.min(...restingHeartRates)
                : null;

        // Upsert daily aggregate
        return this.prisma.dailyAggregate.upsert({
            where: {
                userId_date: {
                    userId,
                    date: startOfDay,
                },
            },
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

    private sumByType(
        measurements: { type: MetricType; value: number }[],
        type: MetricType
    ): number {
        return measurements
            .filter((m) => m.type === type)
            .reduce((sum, m) => sum + m.value, 0);
    }

    private mapMetricType(type: string): MetricType {
        const mapping: Record<string, MetricType> = {
            steps: 'STEPS',
            heart_rate: 'HEART_RATE',
            blood_pressure: 'BLOOD_PRESSURE_SYSTOLIC',
            sleep: 'SLEEP',
            active_energy: 'ACTIVE_ENERGY',
            resting_heart_rate: 'RESTING_HEART_RATE',
            weight: 'WEIGHT',
            body_fat: 'BODY_FAT',
            water_intake: 'WATER_INTAKE',
        };

        const mapped = mapping[type.toLowerCase()];
        if (!mapped) {
            throw new BadRequestException(`Unsupported metric type: ${type}`);
        }
        return mapped;
    }

    private hashIdempotencyKey(userId: string, key: string): string {
        return createHash('sha256').update(`${userId}:${key}`).digest('hex');
    }
}
