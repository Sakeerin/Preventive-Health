/**
 * Model monitoring utilities for drift detection
 */

import * as crypto from 'crypto';

export interface ModelInput {
    aggregates: Array<{
        steps: number;
        sleepDuration: number;
        activeEnergy: number;
        averageHeartRate: number | null;
        restingHeartRate: number | null;
    }>;
    profile?: {
        age?: number;
        gender?: string;
        activityLevel?: string;
    };
}

export interface DriftAnalysis {
    inputHash: string;
    inputSummary: {
        dataPointCount: number;
        avgSteps: number;
        avgSleep: number;
        avgEnergy: number;
        hasHeartRateData: boolean;
    };
    driftScore: number | null;
    isAnomaly: boolean;
    timestamp: Date;
}

// Running statistics for drift detection
let inputStats = {
    count: 0,
    stepsSum: 0,
    stepsSquaredSum: 0,
    sleepSum: 0,
    sleepSquaredSum: 0,
};

/**
 * Generate hash of model input (for deduplication and tracking)
 */
export function generateInputHash(input: ModelInput): string {
    const normalized = {
        aggregatesHash: input.aggregates.map(a => ({
            s: Math.round(a.steps / 100) * 100,
            sl: Math.round(a.sleepDuration / 10) * 10,
            e: Math.round(a.activeEnergy / 10) * 10,
        })),
        hasProfile: !!input.profile,
    };

    const json = JSON.stringify(normalized);
    return crypto.createHash('sha256').update(json).digest('hex').substring(0, 16);
}

/**
 * Generate summary of input (no PII)
 */
export function generateInputSummary(input: ModelInput): DriftAnalysis['inputSummary'] {
    const { aggregates } = input;

    if (aggregates.length === 0) {
        return {
            dataPointCount: 0,
            avgSteps: 0,
            avgSleep: 0,
            avgEnergy: 0,
            hasHeartRateData: false,
        };
    }

    const avgSteps = aggregates.reduce((s, a) => s + a.steps, 0) / aggregates.length;
    const avgSleep = aggregates.reduce((s, a) => s + a.sleepDuration, 0) / aggregates.length;
    const avgEnergy = aggregates.reduce((s, a) => s + a.activeEnergy, 0) / aggregates.length;
    const hasHeartRateData = aggregates.some(a => a.averageHeartRate !== null);

    return {
        dataPointCount: aggregates.length,
        avgSteps: Math.round(avgSteps),
        avgSleep: Math.round(avgSleep),
        avgEnergy: Math.round(avgEnergy),
        hasHeartRateData,
    };
}

/**
 * Calculate drift score based on input deviation from historical norm
 * Returns null if not enough data for comparison
 */
export function calculateDriftScore(input: ModelInput): number | null {
    if (inputStats.count < 100) {
        return null; // Not enough data for meaningful drift detection
    }

    const summary = generateInputSummary(input);

    // Calculate z-scores for key metrics
    const stepsMean = inputStats.stepsSum / inputStats.count;
    const stepsStd = Math.sqrt(
        (inputStats.stepsSquaredSum / inputStats.count) - Math.pow(stepsMean, 2)
    );

    if (stepsStd === 0) return null;

    const stepsZScore = Math.abs((summary.avgSteps - stepsMean) / stepsStd);

    // Drift score: 0-1 where higher = more drift
    return Math.min(1, stepsZScore / 3);
}

/**
 * Update running statistics with new input
 */
export function updateInputStats(input: ModelInput): void {
    const summary = generateInputSummary(input);

    inputStats.count += 1;
    inputStats.stepsSum += summary.avgSteps;
    inputStats.stepsSquaredSum += Math.pow(summary.avgSteps, 2);
    inputStats.sleepSum += summary.avgSleep;
    inputStats.sleepSquaredSum += Math.pow(summary.avgSleep, 2);
}

/**
 * Check if input is an anomaly
 */
export function isInputAnomaly(input: ModelInput): boolean {
    const summary = generateInputSummary(input);

    // Simple anomaly checks
    if (summary.avgSteps > 50000) return true; // Unrealistic step count
    if (summary.avgSleep > 720) return true; // More than 12 hours average
    if (summary.avgEnergy > 5000) return true; // Unrealistic energy burn
    if (summary.dataPointCount === 0) return true; // No data

    return false;
}

/**
 * Full drift analysis for model logging
 */
export function analyzeDrift(input: ModelInput): DriftAnalysis {
    const inputHash = generateInputHash(input);
    const inputSummary = generateInputSummary(input);
    const driftScore = calculateDriftScore(input);
    const isAnomaly = isInputAnomaly(input);

    // Update running stats for future comparisons
    if (!isAnomaly) {
        updateInputStats(input);
    }

    return {
        inputHash,
        inputSummary,
        driftScore,
        isAnomaly,
        timestamp: new Date(),
    };
}

/**
 * Reset statistics (for testing or retraining)
 */
export function resetInputStats(): void {
    inputStats = {
        count: 0,
        stepsSum: 0,
        stepsSquaredSum: 0,
        sleepSum: 0,
        sleepSquaredSum: 0,
    };
}
