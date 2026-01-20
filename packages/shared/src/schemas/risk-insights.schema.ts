import { z } from 'zod';

// Risk level enum
export const riskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

// Risk category enum
export const riskCategorySchema = z.enum([
    'OVERALL_WELLNESS',
    'CARDIOVASCULAR',
    'SLEEP_QUALITY',
    'ACTIVITY_LEVEL',
]);

// Risk factor schema
export const riskFactorSchema = z.object({
    name: z.string(),
    contribution: z.number().min(-1).max(1),
    description: z.string(),
    icon: z.string().optional(),
});

// Risk score response
export const riskScoreResponseSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    category: riskCategorySchema,
    level: riskLevelSchema,
    score: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    factors: z.array(riskFactorSchema),
    modelVersion: z.string(),
    createdAt: z.coerce.date(),
});

// Explainability output
export const riskExplanationSchema = z.object({
    riskScoreId: z.string().uuid(),
    summary: z.string(),
    primaryFactors: z.array(z.object({
        factor: riskFactorSchema,
        explanation: z.string(),
        recommendation: z.string().optional(),
    })),
    trend: z.object({
        direction: z.enum(['improving', 'stable', 'declining']),
        change: z.number(),
        period: z.string(),
    }).optional(),
    disclaimer: z.string(),
});

// History query params
export const riskHistoryQuerySchema = z.object({
    category: riskCategorySchema.optional(),
    days: z.coerce.number().min(7).max(90).default(30),
    limit: z.coerce.number().min(1).max(100).default(30),
});

// Type exports
export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type RiskCategory = z.infer<typeof riskCategorySchema>;
export type RiskFactor = z.infer<typeof riskFactorSchema>;
export type RiskScoreResponse = z.infer<typeof riskScoreResponseSchema>;
export type RiskExplanation = z.infer<typeof riskExplanationSchema>;
export type RiskHistoryQuery = z.infer<typeof riskHistoryQuerySchema>;
