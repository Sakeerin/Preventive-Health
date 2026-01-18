import { Prisma, PrismaClient } from '@prisma/client';

export interface AuditContext {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
}

// Tables that should be audited
const AUDITED_TABLES = [
    'User',
    'Profile',
    'Consent',
    'ShareGrant',
    'Booking',
    'Goal',
    'RiskScore',
];

// Fields to exclude from audit logs (sensitive data)
const EXCLUDED_FIELDS = ['passwordHash', 'tokenHash', 'pushToken'];

/**
 * Sanitize data by removing sensitive fields
 */
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data };
    for (const field of EXCLUDED_FIELDS) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}

/**
 * Create audit middleware for Prisma client
 * Logs create, update, and delete operations on specified tables
 */
export function auditMiddleware(
    context: () => AuditContext
): Prisma.Middleware {
    return async (params, next) => {
        const { model, action } = params;

        // Only audit specific tables and write operations
        if (!model || !AUDITED_TABLES.includes(model)) {
            return next(params);
        }

        const writeActions = ['create', 'update', 'delete', 'updateMany', 'deleteMany'];
        if (!writeActions.includes(action)) {
            return next(params);
        }

        // Execute the operation
        const result = await next(params);

        // Get audit context
        const { userId, ipAddress, userAgent } = context();

        // Map action to audit log action
        const auditAction = action.startsWith('create')
            ? 'CREATE'
            : action.startsWith('update')
                ? 'UPDATE'
                : 'DELETE';

        // Prepare audit details
        const details: Record<string, unknown> = {};

        if (action === 'create' && params.args?.data) {
            details.created = sanitizeData(params.args.data);
        } else if (action === 'update' && params.args?.data) {
            details.updated = sanitizeData(params.args.data);
            if (params.args?.where) {
                details.where = params.args.where;
            }
        } else if (action === 'delete' && params.args?.where) {
            details.deleted = params.args.where;
        }

        // Get resource ID from result or params
        let resourceId: string | undefined;
        if (result && typeof result === 'object' && 'id' in result) {
            resourceId = result.id as string;
        } else if (params.args?.where?.id) {
            resourceId = params.args.where.id;
        }

        // Create audit log entry (non-blocking)
        // Note: Uses raw query to avoid infinite recursion
        const prisma = params as unknown as { __prismaClient?: PrismaClient };
        if (prisma.__prismaClient) {
            prisma.__prismaClient.auditLog
                .create({
                    data: {
                        userId,
                        action: auditAction,
                        resource: model,
                        resourceId,
                        details,
                        ipAddress,
                        userAgent,
                    },
                })
                .catch((error) => {
                    console.error('Failed to create audit log:', error);
                });
        }

        return result;
    };
}
