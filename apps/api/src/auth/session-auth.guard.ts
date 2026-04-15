import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<{
            headers: Record<string, string | string[] | undefined>;
            user?: unknown;
        }>();

        const authorization = request.headers.authorization;
        const rawHeader = Array.isArray(authorization) ? authorization[0] : authorization;

        if (!rawHeader || !rawHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing bearer token');
        }

        const token = rawHeader.slice('Bearer '.length).trim();
        if (!token) {
            throw new UnauthorizedException('Missing bearer token');
        }

        const user = await this.authService.authenticateBearerToken(token);
        if (!user) {
            throw new UnauthorizedException('Invalid or expired session');
        }

        request.user = user;
        return true;
    }
}
