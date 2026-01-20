/**
 * Category-specific risk calculations
 */

import type { RiskFactor } from '@preventive-health/shared';
import { RISK_THRESHOLDS } from '@preventive-health/shared';

export interface DailyAggregateInput {
    steps: number;
    activeEnergy: number;
    sleepDuration: number;
    averageHeartRate: number | null;
    restingHeartRate: number | null;
    workoutCount: number;
    workoutDuration: number;
}

export interface CategoryRiskResult {
    category: string;
    score: number;
    level: 'low' | 'medium' | 'high';
    confidence: number;
    factors: RiskFactor[];
}

/**
 * Get risk level from score
 */
function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score <= RISK_THRESHOLDS.low.max) return 'low';
    if (score <= RISK_THRESHOLDS.medium.max) return 'medium';
    return 'high';
}

/**
 * Calculate cardiovascular health risk
 */
export function calculateCardiovascularRisk(
    aggregates: DailyAggregateInput[]
): CategoryRiskResult {
    const factors: RiskFactor[] = [];
    let score = 30; // Base score

    if (aggregates.length === 0) {
        return {
            category: 'CARDIOVASCULAR',
            score: 50,
            level: 'medium',
            confidence: 0.1,
            factors: [{ name: 'Insufficient Data', contribution: 0, description: 'Not enough data to assess cardiovascular health' }],
        };
    }

    // Resting heart rate analysis
    const restingHRs = aggregates
        .map(a => a.restingHeartRate)
        .filter((hr): hr is number => hr !== null);

    if (restingHRs.length > 0) {
        const avgRestingHR = restingHRs.reduce((a, b) => a + b, 0) / restingHRs.length;

        if (avgRestingHR > 80) {
            score += 20;
            factors.push({
                name: 'Elevated Resting Heart Rate',
                contribution: 0.4,
                description: `Average resting HR of ${Math.round(avgRestingHR)} bpm is above optimal range`,
            });
        } else if (avgRestingHR >= 60 && avgRestingHR <= 70) {
            score -= 10;
            factors.push({
                name: 'Healthy Resting Heart Rate',
                contribution: -0.2,
                description: `Average resting HR of ${Math.round(avgRestingHR)} bpm is in optimal range`,
            });
        }
    }

    // Heart rate variability proxy (using average HR consistency)
    const heartRates = aggregates
        .map(a => a.averageHeartRate)
        .filter((hr): hr is number => hr !== null);

    if (heartRates.length >= 7) {
        const variance = calculateVariance(heartRates);
        if (variance < 5) {
            score -= 5;
            factors.push({
                name: 'Consistent Heart Rate',
                contribution: -0.1,
                description: 'Your heart rate shows healthy consistency',
            });
        }
    }

    // Activity impact on cardiovascular health
    const avgSteps = aggregates.reduce((s, a) => s + a.steps, 0) / aggregates.length;
    if (avgSteps < 3000) {
        score += 15;
        factors.push({
            name: 'Sedentary Lifestyle',
            contribution: 0.3,
            description: 'Very low daily step count may impact cardiovascular health',
        });
    }

    const finalScore = Math.max(0, Math.min(100, score));

    return {
        category: 'CARDIOVASCULAR',
        score: finalScore,
        level: getRiskLevel(finalScore),
        confidence: Math.min(0.9, aggregates.length / 14),
        factors,
    };
}

/**
 * Calculate sleep quality risk
 */
export function calculateSleepRisk(
    aggregates: DailyAggregateInput[]
): CategoryRiskResult {
    const factors: RiskFactor[] = [];
    let score = 25;

    if (aggregates.length === 0) {
        return {
            category: 'SLEEP_QUALITY',
            score: 50,
            level: 'medium',
            confidence: 0.1,
            factors: [{ name: 'Insufficient Data', contribution: 0, description: 'Not enough data to assess sleep quality' }],
        };
    }

    const sleepDurations = aggregates.map(a => a.sleepDuration);
    const avgSleep = sleepDurations.reduce((a, b) => a + b, 0) / sleepDurations.length;
    const sleepVariance = calculateVariance(sleepDurations);

    // Duration analysis
    if (avgSleep < 300) { // Less than 5 hours
        score += 35;
        factors.push({
            name: 'Severe Sleep Deficiency',
            contribution: 0.7,
            description: `Average sleep of ${Math.round(avgSleep / 60)} hours is critically low`,
        });
    } else if (avgSleep < 360) { // Less than 6 hours
        score += 25;
        factors.push({
            name: 'Insufficient Sleep',
            contribution: 0.5,
            description: `Average sleep of ${Math.round(avgSleep / 60)} hours is below recommended`,
        });
    } else if (avgSleep >= 420 && avgSleep <= 540) { // 7-9 hours
        score -= 15;
        factors.push({
            name: 'Optimal Sleep Duration',
            contribution: -0.3,
            description: `Average sleep of ${(avgSleep / 60).toFixed(1)} hours is in the healthy range`,
        });
    } else if (avgSleep > 600) { // More than 10 hours
        score += 10;
        factors.push({
            name: 'Excessive Sleep',
            contribution: 0.2,
            description: 'Sleeping too much can sometimes indicate underlying issues',
        });
    }

    // Consistency analysis
    if (sleepVariance > 3600) { // More than 60 min variance
        score += 15;
        factors.push({
            name: 'Inconsistent Sleep Schedule',
            contribution: 0.3,
            description: 'Your sleep schedule varies significantly day to day',
        });
    } else if (sleepVariance < 900) { // Less than 30 min variance
        score -= 10;
        factors.push({
            name: 'Consistent Sleep Schedule',
            contribution: -0.2,
            description: 'You maintain a regular sleep schedule',
        });
    }

    const finalScore = Math.max(0, Math.min(100, score));

    return {
        category: 'SLEEP_QUALITY',
        score: finalScore,
        level: getRiskLevel(finalScore),
        confidence: Math.min(0.9, aggregates.length / 14),
        factors,
    };
}

/**
 * Calculate activity level risk
 */
export function calculateActivityRisk(
    aggregates: DailyAggregateInput[]
): CategoryRiskResult {
    const factors: RiskFactor[] = [];
    let score = 30;

    if (aggregates.length === 0) {
        return {
            category: 'ACTIVITY_LEVEL',
            score: 50,
            level: 'medium',
            confidence: 0.1,
            factors: [{ name: 'Insufficient Data', contribution: 0, description: 'Not enough data to assess activity level' }],
        };
    }

    const avgSteps = aggregates.reduce((s, a) => s + a.steps, 0) / aggregates.length;
    const avgEnergy = aggregates.reduce((s, a) => s + a.activeEnergy, 0) / aggregates.length;
    const totalWorkouts = aggregates.reduce((s, a) => s + a.workoutCount, 0);
    const workoutsPerWeek = (totalWorkouts / aggregates.length) * 7;

    // Steps analysis
    if (avgSteps < 3000) {
        score += 30;
        factors.push({
            name: 'Very Low Activity',
            contribution: 0.6,
            description: `Average of ${Math.round(avgSteps).toLocaleString()} steps/day indicates sedentary lifestyle`,
        });
    } else if (avgSteps < 5000) {
        score += 15;
        factors.push({
            name: 'Low Activity',
            contribution: 0.3,
            description: `Average of ${Math.round(avgSteps).toLocaleString()} steps/day is below recommended`,
        });
    } else if (avgSteps >= 10000) {
        score -= 20;
        factors.push({
            name: 'Excellent Activity Level',
            contribution: -0.4,
            description: `Average of ${Math.round(avgSteps).toLocaleString()} steps/day exceeds goals`,
        });
    } else if (avgSteps >= 7500) {
        score -= 10;
        factors.push({
            name: 'Good Activity Level',
            contribution: -0.2,
            description: `Average of ${Math.round(avgSteps).toLocaleString()} steps/day is healthy`,
        });
    }

    // Workout frequency
    if (workoutsPerWeek < 1) {
        score += 15;
        factors.push({
            name: 'Infrequent Workouts',
            contribution: 0.3,
            description: 'Less than one workout per week',
        });
    } else if (workoutsPerWeek >= 3) {
        score -= 15;
        factors.push({
            name: 'Regular Exercise',
            contribution: -0.3,
            description: `${workoutsPerWeek.toFixed(1)} workouts per week is excellent`,
        });
    }

    // Active energy
    if (avgEnergy < 200) {
        score += 10;
        factors.push({
            name: 'Low Active Energy',
            contribution: 0.2,
            description: 'Low calorie burn from activity',
        });
    } else if (avgEnergy >= 500) {
        score -= 10;
        factors.push({
            name: 'High Active Energy',
            contribution: -0.2,
            description: 'Good calorie burn from daily activities',
        });
    }

    const finalScore = Math.max(0, Math.min(100, score));

    return {
        category: 'ACTIVITY_LEVEL',
        score: finalScore,
        level: getRiskLevel(finalScore),
        confidence: Math.min(0.9, aggregates.length / 14),
        factors,
    };
}

/**
 * Aggregate all category risks into overall wellness score
 */
export function calculateOverallWellness(
    categoryResults: CategoryRiskResult[]
): CategoryRiskResult {
    if (categoryResults.length === 0) {
        return {
            category: 'OVERALL_WELLNESS',
            score: 50,
            level: 'medium',
            confidence: 0,
            factors: [],
        };
    }

    // Weighted average of category scores
    const weights: Record<string, number> = {
        CARDIOVASCULAR: 0.35,
        SLEEP_QUALITY: 0.35,
        ACTIVITY_LEVEL: 0.30,
    };

    let weightedSum = 0;
    let totalWeight = 0;
    let minConfidence = 1;

    const allFactors: RiskFactor[] = [];

    for (const result of categoryResults) {
        const weight = weights[result.category] || 0.25;
        weightedSum += result.score * weight;
        totalWeight += weight;
        minConfidence = Math.min(minConfidence, result.confidence);

        // Include top factors from each category
        const topFactors = result.factors
            .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
            .slice(0, 2);
        allFactors.push(...topFactors);
    }

    const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 50;

    return {
        category: 'OVERALL_WELLNESS',
        score: Math.round(overallScore),
        level: getRiskLevel(overallScore),
        confidence: minConfidence,
        factors: allFactors.slice(0, 5), // Top 5 factors
    };
}

// Helper function
function calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}
