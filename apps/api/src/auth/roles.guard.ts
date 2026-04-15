import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './auth.constants';
import { AuthenticatedUser, UserRole } from './auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Authenticated user context not found');
        }

        const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));
        if (!hasRequiredRole) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
