import type {
    RiskLevel,
    RiskScore,
    RiskFactor,
    DailyAggregate,
} from '@preventive-health/shared';
import { RISK_THRESHOLDS } from '@preventive-health/shared';

export interface RiskModelConfig {
    version: string;
    weights: Record<string, number>;
}

export interface RiskInput {
    userId: string;
    aggregates: DailyAggregate[];
    profile?: {
        age?: number;
        gender?: string;
        activityLevel?: string;
    };
}

/**
 * Calculate risk level based on score
 */
export function getRiskLevel(score: number): RiskLevel {
    if (score <= RISK_THRESHOLDS.low.max) return 'low';
    if (score <= RISK_THRESHOLDS.medium.max) return 'medium';
    return 'high';
}

/**
 * Calculate confidence based on data availability
 */
export function calculateConfidence(aggregates: DailyAggregate[]): number {
    if (aggregates.length === 0) return 0;
    if (aggregates.length < 7) return 0.3;
    if (aggregates.length < 14) return 0.5;
    if (aggregates.length < 30) return 0.7;
    return 0.9;
}

/**
 * Placeholder risk scoring function
 * Real implementation would use ML model
 */
export function calculateRiskScore(
    input: RiskInput,
    config: RiskModelConfig
): Omit<RiskScore, 'id' | 'createdAt'> {
    const { userId, aggregates, profile } = input;

    // Placeholder scoring logic
    // In production, this would call an ML model
    const factors: RiskFactor[] = [];
    let baseScore = 25;

    // Activity factor
    if (aggregates.length > 0) {
        const avgSteps =
            aggregates.reduce((sum, a) => sum + a.steps, 0) / aggregates.length;
        if (avgSteps < 5000) {
            baseScore += 15;
            factors.push({
                name: 'Low Activity',
                contribution: 0.3,
                description: 'Daily step count below recommended level',
            });
        } else if (avgSteps >= 10000) {
            baseScore -= 10;
            factors.push({
                name: 'Good Activity',
                contribution: -0.2,
                description: 'Meeting daily step goals',
            });
        }
    }

    // Sleep factor
    if (aggregates.length > 0) {
        const avgSleep =
            aggregates.reduce((sum, a) => sum + a.sleepDuration, 0) /
            aggregates.length;
        if (avgSleep < 360) {
            // Less than 6 hours
            baseScore += 20;
            factors.push({
                name: 'Insufficient Sleep',
                contribution: 0.4,
                description: 'Average sleep duration below 6 hours',
            });
        } else if (avgSleep >= 420 && avgSleep <= 540) {
            // 7-9 hours
            baseScore -= 10;
            factors.push({
                name: 'Good Sleep',
                contribution: -0.2,
                description: 'Average sleep duration in healthy range',
            });
        }
    }

    // Clamp score
    const finalScore = Math.max(0, Math.min(100, baseScore));

    return {
        userId,
        modelVersion: config.version,
        category: 'general_wellness',
        level: getRiskLevel(finalScore),
        score: finalScore,
        confidence: calculateConfidence(aggregates),
        factors,
    };
}
