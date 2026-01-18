import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

/**
 * Creates a new Prisma client instance with logging configured
 */
export function createPrismaClient(): PrismaClient {
    return new PrismaClient({
        log:
            process.env.NODE_ENV === 'development'
                ? ['query', 'error', 'warn']
                : ['error'],
    });
}

/**
 * Singleton Prisma client for use across the application
 * Uses global variable to prevent multiple instances in development
 */
export const prisma =
    globalThis.__prisma ??
    (() => {
        const client = createPrismaClient();
        if (process.env.NODE_ENV !== 'production') {
            globalThis.__prisma = client;
        }
        return client;
    })();
