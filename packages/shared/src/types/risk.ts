export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskScore {
    id: string;
    userId: string;
    modelVersion: string;
    category: string;
    level: RiskLevel;
    score: number; // 0-100
    confidence: number; // 0-1
    factors: RiskFactor[];
    createdAt: Date;
}

export interface RiskFactor {
    name: string;
    contribution: number; // -1 to 1
    description: string;
}

export interface Insight {
    id: string;
    userId: string;
    type: 'risk' | 'trend' | 'recommendation' | 'achievement';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    actionable: boolean;
    action?: InsightAction;
    expiresAt?: Date;
    createdAt: Date;
}

export interface InsightAction {
    type: 'link' | 'goal' | 'booking';
    label: string;
    target: string;
}
