export type UserRole = 'user' | 'provider' | 'admin';

export interface AuthenticatedUser {
    id: string;
    email: string;
    roles: UserRole[];
    sessionId: string;
}
