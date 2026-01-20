import { z } from 'zod';

// Reminder type options
export const reminderTypeSchema = z.enum([
    'HYDRATION',
    'MOVEMENT',
    'SLEEP',
    'MEDICATION',
    'WORKOUT',
    'CUSTOM',
]);

// Schedule configuration for reminders
export const scheduleConfigSchema = z.object({
    type: z.enum(['daily', 'weekly', 'interval']),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format').optional(),
    days: z.array(z.number().min(0).max(6)).optional(), // 0 = Sunday, 6 = Saturday
    intervalMinutes: z.number().positive().optional(),
});

export const createReminderSchema = z.object({
    type: reminderTypeSchema,
    title: z.string().min(1, 'Title is required').max(100),
    message: z.string().max(500).optional(),
    schedule: scheduleConfigSchema,
    quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
});

export const updateReminderSchema = createReminderSchema.partial().extend({
    isActive: z.boolean().optional(),
});

export const reminderResponseSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: z.string(),
    title: z.string(),
    message: z.string().nullable(),
    schedule: scheduleConfigSchema,
    quietHoursStart: z.string().nullable(),
    quietHoursEnd: z.string().nullable(),
    isActive: z.boolean(),
    lastTriggered: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

// Type exports
export type ReminderType = z.infer<typeof reminderTypeSchema>;
export type ScheduleConfig = z.infer<typeof scheduleConfigSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type ReminderResponse = z.infer<typeof reminderResponseSchema>;
