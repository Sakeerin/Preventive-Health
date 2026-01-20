import { z } from 'zod';

// Goal types matching Prisma enum
export const goalTypeSchema = z.enum([
    'STEPS',
    'ACTIVE_ENERGY',
    'SLEEP_DURATION',
    'WATER_INTAKE',
    'WORKOUT_COUNT',
    'WEIGHT',
]);

export const frequencySchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY']);

export const createGoalSchema = z.object({
    type: goalTypeSchema,
    targetValue: z.number().positive('Target value must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    frequency: frequencySchema,
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
    isActive: z.boolean().optional(),
});

export const goalResponseSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: goalTypeSchema,
    targetValue: z.number(),
    unit: z.string(),
    frequency: frequencySchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export const goalProgressSchema = z.object({
    id: z.string().uuid(),
    type: goalTypeSchema,
    targetValue: z.number(),
    currentValue: z.number(),
    unit: z.string(),
    frequency: frequencySchema,
    progress: z.number().min(0).max(100),
    isCompleted: z.boolean(),
});

// Type exports
export type GoalType = z.infer<typeof goalTypeSchema>;
export type Frequency = z.infer<typeof frequencySchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalResponse = z.infer<typeof goalResponseSchema>;
export type GoalProgress = z.infer<typeof goalProgressSchema>;
