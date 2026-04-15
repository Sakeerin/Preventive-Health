import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@preventive-health/database';
import { AuthenticatedUser, UserRole } from './auth.types';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaClient) { }

    async authenticateBearerToken(token: string): Promise<AuthenticatedUser | null> {
        const tokenHash = createHash('sha256').update(token).digest('hex');

        const session = await this.prisma.session.findUnique({
            where: { tokenHash },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
            return null;
        }

        const roles = await this.resolveRoles(session.user.id, session.user.email);

        return {
            id: session.user.id,
            email: session.user.email,
            roles,
            sessionId: session.id,
        };
    }

    private async resolveRoles(userId: string, email: string): Promise<UserRole[]> {
        const roles = new Set<UserRole>(['user']);

        const adminEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean);

        if (adminEmails.includes(email.toLowerCase())) {
            roles.add('admin');
        }

        const providerAccount = await this.prisma.provider.findFirst({
            where: { userId, isActive: true },
            select: { id: true },
        });

        if (providerAccount) {
            roles.add('provider');
        }

        return [...roles];
    }
}
