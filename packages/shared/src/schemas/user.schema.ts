import { z } from 'zod';

export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    dateOfBirth: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createUserSchema = userSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const updateUserSchema = createUserSchema.partial();

export const profileSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    height: z.number().positive().optional(),
    weight: z.number().positive().optional(),
    activityLevel: z
        .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
        .optional(),
    healthGoals: z.array(z.string()).optional(),
});

export const consentSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: z.enum(['data_collection', 'sharing', 'marketing']),
    granted: z.boolean(),
    grantedAt: z.date().optional(),
    revokedAt: z.date().optional(),
});

export type UserInput = z.infer<typeof createUserSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
