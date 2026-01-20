import { z } from 'zod';

// Notification type matching Prisma enum
export const notificationTypeSchema = z.enum([
    'REMINDER',
    'INSIGHT',
    'ACHIEVEMENT',
    'BOOKING',
    'MESSAGE',
    'SYSTEM',
]);

export const notificationStatusSchema = z.enum([
    'PENDING',
    'SENT',
    'DELIVERED',
    'FAILED',
]);

export const notificationResponseSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: notificationTypeSchema,
    title: z.string(),
    body: z.string(),
    data: z.record(z.any()).nullable(),
    status: notificationStatusSchema,
    sentAt: z.coerce.date().nullable(),
    readAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
});

// Notification preferences
export const notificationPreferencesSchema = z.object({
    reminders: z.boolean().default(true),
    insights: z.boolean().default(true),
    achievements: z.boolean().default(true),
    bookings: z.boolean().default(true),
    messages: z.boolean().default(true),
    system: z.boolean().default(true),
    pushEnabled: z.boolean().default(true),
    emailEnabled: z.boolean().default(false),
    quietHoursEnabled: z.boolean().default(false),
    quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
});

export const updatePreferencesSchema = notificationPreferencesSchema.partial();

// Type exports
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationStatus = z.infer<typeof notificationStatusSchema>;
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
