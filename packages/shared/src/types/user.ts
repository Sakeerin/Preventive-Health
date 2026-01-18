export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Profile {
    id: string;
    userId: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    height?: number; // cm
    weight?: number; // kg
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    healthGoals?: string[];
}

export interface Consent {
    id: string;
    userId: string;
    type: 'data_collection' | 'sharing' | 'marketing';
    granted: boolean;
    grantedAt?: Date;
    revokedAt?: Date;
}
