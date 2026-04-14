import { z } from 'zod';

// ============================================
// CONTENT SCHEMAS
// ============================================

export const ContentTypeEnum = z.enum([
    'ARTICLE',
    'VIDEO',
    'AUDIO',
    'TEMPLATE',
]);

export const ContentCategoryEnum = z.enum([
    'CARDIOVASCULAR',
    'SLEEP',
    'ACTIVITY',
    'NUTRITION',
    'GENERAL_WELLNESS',
]);

export const ContentStatusEnum = z.enum([
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED',
]);

export const coachingContentSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    type: ContentTypeEnum,
    category: ContentCategoryEnum,
    status: ContentStatusEnum,
    summary: z.string().nullable(),
    content: z.string(), // Markdown or HTML representation
    tags: z.array(z.string()),
    coverImageUrl: z.string().url().nullable(),
    metaDescription: z.string().nullable(),
    authorId: z.string().uuid().nullable(), // Admin/Provider who created it
    publishedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createCoachingContentSchema = z.object({
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    type: ContentTypeEnum,
    category: ContentCategoryEnum.optional().default('GENERAL_WELLNESS'),
    status: ContentStatusEnum.optional().default('DRAFT'),
    summary: z.string().max(500).optional(),
    content: z.string().min(1),
    tags: z.array(z.string()).optional().default([]),
    coverImageUrl: z.string().url().optional(),
    metaDescription: z.string().max(300).optional(),
    publishedAt: z.string().datetime().optional(),
});

export const updateCoachingContentSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    slug: z.string().min(1).max(255).optional(),
    type: ContentTypeEnum.optional(),
    category: ContentCategoryEnum.optional(),
    status: ContentStatusEnum.optional(),
    summary: z.string().max(500).optional(),
    content: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    coverImageUrl: z.string().url().optional(),
    metaDescription: z.string().max(300).optional(),
    publishedAt: z.string().datetime().optional(),
});

export const coachingContentFilterSchema = z.object({
    type: ContentTypeEnum.optional(),
    category: ContentCategoryEnum.optional(),
    status: ContentStatusEnum.optional(),
    search: z.string().optional(),
    tags: z.string().optional(), // Comma separated tags
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CoachingContent = z.infer<typeof coachingContentSchema>;
export type CreateCoachingContent = z.infer<typeof createCoachingContentSchema>;
export type UpdateCoachingContent = z.infer<typeof updateCoachingContentSchema>;
export type CoachingContentFilter = z.infer<typeof coachingContentFilterSchema>;
export type ContentType = z.infer<typeof ContentTypeEnum>;
export type ContentCategory = z.infer<typeof ContentCategoryEnum>;
export type ContentStatus = z.infer<typeof ContentStatusEnum>;
