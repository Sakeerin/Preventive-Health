import { z } from 'zod';

// ============================================
// PROVIDER SCHEMAS
// ============================================

export const ProviderTypeEnum = z.enum([
    'DOCTOR',
    'NURSE',
    'NUTRITIONIST',
    'COACH',
    'THERAPIST',
    'OTHER',
]);

export const providerSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid().nullable(),
    type: ProviderTypeEnum,
    name: z.string().min(1),
    title: z.string().nullable(),
    specialty: z.string().nullable(),
    bio: z.string().nullable(),
    avatarUrl: z.string().url().nullable(),
    licenseNumber: z.string().nullable(),
    isVerified: z.boolean(),
    isActive: z.boolean(),
    availability: z.any().nullable(), // JSON weekly schedule
    metadata: z.any().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createProviderSchema = z.object({
    type: ProviderTypeEnum,
    name: z.string().min(1).max(100),
    title: z.string().max(100).optional(),
    specialty: z.string().max(100).optional(),
    bio: z.string().max(1000).optional(),
    avatarUrl: z.string().url().optional(),
    licenseNumber: z.string().max(50).optional(),
    availability: z.record(z.array(z.object({
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/),
    }))).optional(),
});

export const providerFilterSchema = z.object({
    type: ProviderTypeEnum.optional(),
    specialty: z.string().optional(),
    isVerified: z.boolean().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
});

// ============================================
// BOOKING SCHEMAS
// ============================================

export const BookingTypeEnum = z.enum([
    'VIDEO_CALL',
    'PHONE_CALL',
    'IN_PERSON',
    'CHAT',
]);

export const BookingStatusEnum = z.enum([
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
    'NO_SHOW',
]);

export const bookingSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    providerId: z.string().uuid(),
    type: BookingTypeEnum,
    status: BookingStatusEnum,
    scheduledAt: z.date(),
    duration: z.number().int().positive(),
    notes: z.string().nullable(),
    cancelledAt: z.date().nullable(),
    cancelReason: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createBookingSchema = z.object({
    providerId: z.string().uuid(),
    type: BookingTypeEnum,
    scheduledAt: z.string().datetime(),
    duration: z.number().int().positive().min(15).max(180).default(30),
    notes: z.string().max(500).optional(),
});

export const updateBookingSchema = z.object({
    status: BookingStatusEnum.optional(),
    scheduledAt: z.string().datetime().optional(),
    notes: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
    reason: z.string().max(500).optional(),
});

// ============================================
// CONSULTATION THREAD SCHEMAS
// ============================================

export const ThreadStatusEnum = z.enum([
    'OPEN',
    'CLOSED',
    'ARCHIVED',
]);

export const SenderTypeEnum = z.enum([
    'USER',
    'PROVIDER',
    'SYSTEM',
]);

export const consultationThreadSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    providerId: z.string().uuid(),
    subject: z.string().nullable(),
    status: ThreadStatusEnum,
    closedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createThreadSchema = z.object({
    providerId: z.string().uuid(),
    subject: z.string().max(200).optional(),
    initialMessage: z.string().min(1).max(2000).optional(),
});

export const messageSchema = z.object({
    id: z.string().uuid(),
    threadId: z.string().uuid(),
    senderId: z.string().uuid(),
    senderType: SenderTypeEnum,
    content: z.string(),
    isRead: z.boolean(),
    readAt: z.date().nullable(),
    createdAt: z.date(),
});

export const createMessageSchema = z.object({
    content: z.string().min(1).max(5000),
});

export const attachmentSchema = z.object({
    id: z.string().uuid(),
    messageId: z.string().uuid(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number().int().positive(),
    storageKey: z.string(),
    isEncrypted: z.boolean(),
    createdAt: z.date(),
});

// ============================================
// SHARE GRANT SCHEMAS
// ============================================

export const GranteeTypeEnum = z.enum([
    'USER',
    'PROVIDER',
]);

export const DataTypeEnum = z.enum([
    'MEASUREMENTS',
    'SLEEP_SESSIONS',
    'WORKOUT_SESSIONS',
    'DAILY_AGGREGATES',
    'GOALS',
    'RISK_SCORES',
    'ALL',
]);

export const shareGrantSchema = z.object({
    id: z.string().uuid(),
    grantorId: z.string().uuid(),
    granteeId: z.string().uuid(),
    granteeType: GranteeTypeEnum,
    dataTypes: z.array(z.string()),
    expiresAt: z.date().nullable(),
    revokedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createShareGrantSchema = z.object({
    granteeId: z.string().uuid(),
    granteeType: GranteeTypeEnum,
    dataTypes: z.array(DataTypeEnum).min(1),
    expiresAt: z.string().datetime().optional(),
    durationDays: z.number().int().positive().max(365).optional(),
});

// ============================================
// AUDIT LOG SCHEMAS
// ============================================

export const auditLogSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid().nullable(),
    action: z.string(),
    resource: z.string(),
    resourceId: z.string().nullable(),
    details: z.any().nullable(),
    ipAddress: z.string().nullable(),
    userAgent: z.string().nullable(),
    status: z.string(),
    createdAt: z.date(),
});

export const auditLogFilterSchema = z.object({
    action: z.string().optional(),
    resource: z.string().optional(),
    resourceId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================
// AVAILABILITY SCHEMAS
// ============================================

export const timeSlotSchema = z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
});

export const availabilitySlotSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slots: z.array(z.object({
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        isAvailable: z.boolean(),
    })),
});

export const getAvailabilitySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    duration: z.coerce.number().int().positive().default(30),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type Provider = z.infer<typeof providerSchema>;
export type CreateProvider = z.infer<typeof createProviderSchema>;
export type ProviderFilter = z.infer<typeof providerFilterSchema>;
export type ProviderType = z.infer<typeof ProviderTypeEnum>;

export type Booking = z.infer<typeof bookingSchema>;
export type CreateBooking = z.infer<typeof createBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;
export type CancelBooking = z.infer<typeof cancelBookingSchema>;
export type BookingType = z.infer<typeof BookingTypeEnum>;
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export type ConsultationThread = z.infer<typeof consultationThreadSchema>;
export type CreateThread = z.infer<typeof createThreadSchema>;
export type Message = z.infer<typeof messageSchema>;
export type CreateMessage = z.infer<typeof createMessageSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type ThreadStatus = z.infer<typeof ThreadStatusEnum>;
export type SenderType = z.infer<typeof SenderTypeEnum>;

export type ShareGrant = z.infer<typeof shareGrantSchema>;
export type CreateShareGrant = z.infer<typeof createShareGrantSchema>;
export type GranteeType = z.infer<typeof GranteeTypeEnum>;
export type DataType = z.infer<typeof DataTypeEnum>;

export type AuditLog = z.infer<typeof auditLogSchema>;
export type AuditLogFilter = z.infer<typeof auditLogFilterSchema>;

export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
export type GetAvailability = z.infer<typeof getAvailabilitySchema>;
