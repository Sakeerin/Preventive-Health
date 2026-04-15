import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    ConsentType,
    PrismaClient,
    type Measurement,
    type Profile,
    type User,
} from '@preventive-health/database';

@Injectable()
export class ExportService {
    constructor(private readonly prisma: PrismaClient) { }

    async ensureExportAllowed(userId: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isActive: true },
        });

        if (!user || !user.isActive) {
            throw new NotFoundException('User not found');
        }

        const consent = await this.prisma.consent.findFirst({
            where: {
                userId,
                type: ConsentType.HEALTH_DATA_SHARING,
                granted: true,
                revokedAt: null,
            },
            orderBy: { grantedAt: 'desc' },
        });

        if (!consent) {
            throw new ForbiddenException(
                'Active health-data sharing consent is required before export'
            );
        }
    }

    async getExportData(userId: string): Promise<{
        user: Pick<User, 'id' | 'firstName' | 'lastName' | 'dateOfBirth' | 'email'>;
        profile: Profile | null;
        measurements: Measurement[];
    }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                email: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const [profile, measurements] = await Promise.all([
            this.prisma.profile.findUnique({
                where: { userId },
            }),
            this.prisma.measurement.findMany({
                where: { userId },
                orderBy: { recordedAt: 'desc' },
                take: 1000,
            }),
        ]);

        return { user, profile, measurements };
    }

    async createExportAuditLog(
        userId: string,
        format: 'FHIR' | 'PDF',
        metadata?: Record<string, unknown>
    ): Promise<void> {
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'EXPORT',
                resource: `HealthData:${format}`,
                resourceId: userId,
                details: metadata as any,
                status: 'success',
            },
        });
    }
}
