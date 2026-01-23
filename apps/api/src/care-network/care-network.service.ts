import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, BookingStatus, ThreadStatus, SenderType, GranteeType, ProviderType, BookingType } from '@preventive-health/database';

// Placeholder for authentication - will be replaced with actual auth
const MOCK_USER_ID = 'mock-user-id';

interface ProviderFilter {
    type?: ProviderType;
    specialty?: string;
    isVerified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

interface AvailabilitySlot {
    startTime: Date;
    endTime: Date;
    isAvailable: boolean;
}

interface CreateBookingDto {
    providerId: string;
    type: BookingType;
    scheduledAt: string;
    duration?: number;
    notes?: string;
}

interface CreateThreadDto {
    providerId: string;
    subject?: string;
    initialMessage?: string;
}

interface CreateShareGrantDto {
    granteeId: string;
    granteeType: GranteeType;
    dataTypes: string[];
    expiresAt?: string;
    durationDays?: number;
}

@Injectable()
export class CareNetworkService {
    constructor(private readonly prisma: PrismaClient) { }

    // ============================================
    // PROVIDER METHODS
    // ============================================

    async getProviders(filters: ProviderFilter = {}) {
        const { type, specialty, isVerified, search, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {
            isActive: true,
        };

        if (type) where.type = type;
        if (specialty) where.specialty = { contains: specialty, mode: 'insensitive' };
        if (isVerified !== undefined) where.isVerified = isVerified;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { specialty: { contains: search, mode: 'insensitive' } },
                { bio: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [providers, total] = await Promise.all([
            this.prisma.provider.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { isVerified: 'desc' },
                    { name: 'asc' },
                ],
            }),
            this.prisma.provider.count({ where }),
        ]);

        return {
            providers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getProviderById(id: string) {
        const provider = await this.prisma.provider.findUnique({
            where: { id },
        });

        if (!provider) {
            throw new NotFoundException('Provider not found');
        }

        return provider;
    }

    async getProviderAvailability(
        providerId: string,
        startDate: string,
        endDate?: string,
        slotDuration: number = 30
    ) {
        const provider = await this.getProviderById(providerId);

        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Get existing bookings for the provider in the date range
        const bookings = await this.prisma.booking.findMany({
            where: {
                providerId,
                scheduledAt: {
                    gte: start,
                    lte: end,
                },
                status: {
                    in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
                },
            },
            orderBy: { scheduledAt: 'asc' },
        });

        // Build availability slots based on provider's weekly schedule
        const availability: { date: string; slots: AvailabilitySlot[] }[] = [];
        const weeklySchedule = (provider.availability as Record<string, { start: string; end: string }[]>) || {};

        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayName = dayNames[d.getDay()];
            const daySchedule = weeklySchedule[dayName] || [];
            const dateStr = d.toISOString().split('T')[0];
            const slots: AvailabilitySlot[] = [];

            for (const window of daySchedule) {
                const [startHour, startMin] = window.start.split(':').map(Number);
                const [endHour, endMin] = window.end.split(':').map(Number);

                let slotStart = new Date(d);
                slotStart.setHours(startHour, startMin, 0, 0);

                const windowEnd = new Date(d);
                windowEnd.setHours(endHour, endMin, 0, 0);

                while (slotStart.getTime() + slotDuration * 60 * 1000 <= windowEnd.getTime()) {
                    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

                    // Check if slot conflicts with existing bookings
                    const isBooked = bookings.some(booking => {
                        const bookingStart = new Date(booking.scheduledAt);
                        const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 1000);
                        return slotStart < bookingEnd && slotEnd > bookingStart;
                    });

                    slots.push({
                        startTime: new Date(slotStart),
                        endTime: slotEnd,
                        isAvailable: !isBooked && slotStart > new Date(),
                    });

                    slotStart = slotEnd;
                }
            }

            if (slots.length > 0) {
                availability.push({ date: dateStr, slots });
            }
        }

        return availability;
    }

    // ============================================
    // BOOKING METHODS
    // ============================================

    async getUserBookings(userId: string, status?: BookingStatus) {
        const where: any = { userId };
        if (status) where.status = status;

        return this.prisma.booking.findMany({
            where,
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        specialty: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: { scheduledAt: 'desc' },
        });
    }

    async getBookingById(userId: string, bookingId: string) {
        const booking = await this.prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId,
            },
            include: {
                provider: true,
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    async createBooking(userId: string, dto: CreateBookingDto) {
        // Verify provider exists
        const provider = await this.getProviderById(dto.providerId);

        const scheduledAt = new Date(dto.scheduledAt);
        const duration = dto.duration || 30;

        // Check if the slot is available
        const conflictingBooking = await this.prisma.booking.findFirst({
            where: {
                providerId: dto.providerId,
                status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
                scheduledAt: {
                    gte: new Date(scheduledAt.getTime() - duration * 60 * 1000),
                    lt: new Date(scheduledAt.getTime() + duration * 60 * 1000),
                },
            },
        });

        if (conflictingBooking) {
            throw new BadRequestException('Time slot is not available');
        }

        const booking = await this.prisma.booking.create({
            data: {
                userId,
                providerId: dto.providerId,
                type: dto.type,
                scheduledAt,
                duration,
                notes: dto.notes,
                status: BookingStatus.PENDING,
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        specialty: true,
                    },
                },
            },
        });

        // Log audit
        await this.createAuditLog(userId, 'booking_created', 'Booking', booking.id, {
            providerId: dto.providerId,
            scheduledAt: dto.scheduledAt,
        });

        return booking;
    }

    async updateBooking(
        userId: string,
        bookingId: string,
        updates: { status?: BookingStatus; scheduledAt?: string; notes?: string }
    ) {
        const booking = await this.getBookingById(userId, bookingId);

        if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
            throw new BadRequestException('Cannot update a cancelled or completed booking');
        }

        const data: any = {};
        if (updates.status) data.status = updates.status;
        if (updates.scheduledAt) data.scheduledAt = new Date(updates.scheduledAt);
        if (updates.notes !== undefined) data.notes = updates.notes;

        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data,
            include: {
                provider: {
                    select: { id: true, name: true, type: true, specialty: true },
                },
            },
        });

        await this.createAuditLog(userId, 'booking_updated', 'Booking', bookingId, updates);

        return updated;
    }

    async cancelBooking(userId: string, bookingId: string, reason?: string) {
        const booking = await this.getBookingById(userId, bookingId);

        if (booking.status === BookingStatus.CANCELLED) {
            throw new BadRequestException('Booking is already cancelled');
        }

        if (booking.status === BookingStatus.COMPLETED) {
            throw new BadRequestException('Cannot cancel a completed booking');
        }

        const cancelled = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                cancelledAt: new Date(),
                cancelReason: reason,
            },
        });

        await this.createAuditLog(userId, 'booking_cancelled', 'Booking', bookingId, { reason });

        return cancelled;
    }

    // ============================================
    // CONSULTATION THREAD METHODS
    // ============================================

    async getUserThreads(userId: string, status?: ThreadStatus) {
        const where: any = { userId };
        if (status) where.status = status;

        return this.prisma.consultationThread.findMany({
            where,
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        specialty: true,
                        avatarUrl: true,
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getThreadById(userId: string, threadId: string) {
        const thread = await this.prisma.consultationThread.findFirst({
            where: {
                id: threadId,
                userId,
            },
            include: {
                provider: true,
                messages: {
                    include: {
                        attachments: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!thread) {
            throw new NotFoundException('Consultation thread not found');
        }

        return thread;
    }

    async createThread(userId: string, dto: CreateThreadDto) {
        // Verify provider exists
        await this.getProviderById(dto.providerId);

        const thread = await this.prisma.consultationThread.create({
            data: {
                userId,
                providerId: dto.providerId,
                subject: dto.subject,
                status: ThreadStatus.OPEN,
            },
            include: {
                provider: {
                    select: { id: true, name: true, type: true, specialty: true },
                },
            },
        });

        // Create initial message if provided
        if (dto.initialMessage) {
            await this.prisma.message.create({
                data: {
                    threadId: thread.id,
                    senderId: userId,
                    senderType: SenderType.USER,
                    content: dto.initialMessage,
                },
            });
        }

        await this.createAuditLog(userId, 'thread_created', 'ConsultationThread', thread.id, {
            providerId: dto.providerId,
        });

        return thread;
    }

    async sendMessage(userId: string, threadId: string, content: string) {
        const thread = await this.getThreadById(userId, threadId);

        if (thread.status !== ThreadStatus.OPEN) {
            throw new BadRequestException('Cannot send messages to a closed thread');
        }

        const message = await this.prisma.message.create({
            data: {
                threadId,
                senderId: userId,
                senderType: SenderType.USER,
                content,
            },
        });

        // Update thread's updatedAt
        await this.prisma.consultationThread.update({
            where: { id: threadId },
            data: { updatedAt: new Date() },
        });

        await this.createAuditLog(userId, 'message_sent', 'Message', message.id, { threadId });

        return message;
    }

    async closeThread(userId: string, threadId: string) {
        const thread = await this.getThreadById(userId, threadId);

        if (thread.status !== ThreadStatus.OPEN) {
            throw new BadRequestException('Thread is already closed');
        }

        const closed = await this.prisma.consultationThread.update({
            where: { id: threadId },
            data: {
                status: ThreadStatus.CLOSED,
                closedAt: new Date(),
            },
        });

        await this.createAuditLog(userId, 'thread_closed', 'ConsultationThread', threadId, {});

        return closed;
    }

    // ============================================
    // SHARE GRANT METHODS
    // ============================================

    async getUserShareGrants(userId: string, includeExpired: boolean = false) {
        const where: any = { grantorId: userId };

        if (!includeExpired) {
            where.revokedAt = null;
            where.OR = [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
            ];
        }

        return this.prisma.shareGrant.findMany({
            where,
            include: {
                grantee: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getShareGrantById(userId: string, grantId: string) {
        const grant = await this.prisma.shareGrant.findFirst({
            where: {
                id: grantId,
                grantorId: userId,
            },
            include: {
                grantee: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });

        if (!grant) {
            throw new NotFoundException('Share grant not found');
        }

        return grant;
    }

    async createShareGrant(userId: string, dto: CreateShareGrantDto) {
        // Verify grantee exists
        const grantee = await this.prisma.user.findUnique({
            where: { id: dto.granteeId },
        });

        if (!grantee) {
            throw new NotFoundException('Grantee user not found');
        }

        if (dto.granteeId === userId) {
            throw new BadRequestException('Cannot grant access to yourself');
        }

        // Calculate expiration
        let expiresAt: Date | null = null;
        if (dto.expiresAt) {
            expiresAt = new Date(dto.expiresAt);
        } else if (dto.durationDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + dto.durationDays);
        }

        const grant = await this.prisma.shareGrant.create({
            data: {
                grantorId: userId,
                granteeId: dto.granteeId,
                granteeType: dto.granteeType,
                dataTypes: dto.dataTypes,
                expiresAt,
            },
            include: {
                grantee: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });

        await this.createAuditLog(userId, 'grant_created', 'ShareGrant', grant.id, {
            granteeId: dto.granteeId,
            dataTypes: dto.dataTypes,
            expiresAt,
        });

        return grant;
    }

    async revokeShareGrant(userId: string, grantId: string) {
        const grant = await this.getShareGrantById(userId, grantId);

        if (grant.revokedAt) {
            throw new BadRequestException('Grant is already revoked');
        }

        const revoked = await this.prisma.shareGrant.update({
            where: { id: grantId },
            data: { revokedAt: new Date() },
        });

        await this.createAuditLog(userId, 'grant_revoked', 'ShareGrant', grantId, {});

        return revoked;
    }

    // ============================================
    // AUDIT LOG METHODS
    // ============================================

    async getAuditLogs(
        userId: string,
        filters: {
            action?: string;
            resource?: string;
            startDate?: string;
            endDate?: string;
            page?: number;
            limit?: number;
        } = {}
    ) {
        const { action, resource, startDate, endDate, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (action) where.action = action;
        if (resource) where.resource = resource;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async createAuditLog(
        userId: string,
        action: string,
        resource: string,
        resourceId: string,
        details: any,
        ipAddress?: string,
        userAgent?: string
    ) {
        return this.prisma.auditLog.create({
            data: {
                userId,
                action,
                resource,
                resourceId,
                details,
                ipAddress,
                userAgent,
                status: 'success',
            },
        });
    }
}
