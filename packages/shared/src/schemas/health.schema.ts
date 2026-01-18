import { z } from 'zod';

export const metricTypeSchema = z.enum([
    'steps',
    'heart_rate',
    'blood_pressure',
    'sleep',
    'active_energy',
    'resting_heart_rate',
    'weight',
    'body_fat',
    'water_intake',
]);

export const dataSourceSchema = z.enum([
    'healthkit',
    'health_connect',
    'manual',
    'device',
]);

export const measurementSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: metricTypeSchema,
    value: z.number(),
    unit: z.string(),
    source: dataSourceSchema,
    sourceId: z.string().optional(),
    recordedAt: z.date(),
    createdAt: z.date(),
});

export const createMeasurementSchema = measurementSchema.omit({
    id: true,
    createdAt: true,
});

export const sleepStageSchema = z.object({
    stage: z.enum(['awake', 'light', 'deep', 'rem']),
    startTime: z.date(),
    endTime: z.date(),
    duration: z.number().positive(),
});

export const sleepSessionSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    startTime: z.date(),
    endTime: z.date(),
    duration: z.number().positive(),
    quality: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
    stages: z.array(sleepStageSchema).optional(),
    source: dataSourceSchema,
});

export const workoutSessionSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    duration: z.number().positive(),
    caloriesBurned: z.number().positive().optional(),
    distance: z.number().positive().optional(),
    averageHeartRate: z.number().positive().optional(),
    source: dataSourceSchema,
});

export type MeasurementInput = z.infer<typeof createMeasurementSchema>;
