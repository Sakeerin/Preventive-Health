import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, RiskLevel, RiskScore } from '@preventive-health/database';
import { NotificationsService } from '../notifications/notifications.service';

// Import AI functions - these would normally come from @preventive-health/ai package
// For now we'll inline the core logic
interface RiskFactor {
    name: string;
    contribution: number;
    description: string;
}

interface CategoryRiskResult {
    category: string;
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    factors: RiskFactor[];
}

interface RiskExplanation {
    summary: string;
    primaryFactors: Array<{
        factor: RiskFactor;
        explanation: string;
        recommendation?: string;
    }>;
    trend?: {
        direction: 'improving' | 'stable' | 'declining';
        change: number;
        period: string;
    };
    disclaimer: string;
}

const RISK_THRESHOLDS = {
    low: { min: 0, max: 33 },
    medium: { min: 34, max: 66 },
    high: { min: 67, max: 100 },
};

const DISCLAIMER = 'This information is for educational purposes only and does not constitute medical advice. Please consult a healthcare professional for personalized guidance.';

@Injectable()
export class RiskInsightsService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly notificationsService: NotificationsService
    ) { }

    /**
     * Get latest risk scores for a user
     */
    async getLatestRiskScores(userId: string): Promise<RiskScore[]> {
        const categories = ['OVERALL_WELLNESS', 'CARDIOVASCULAR', 'SLEEP_QUALITY', 'ACTIVITY_LEVEL'];

        const latestScores: RiskScore[] = [];

        for (const category of categories) {
            const score = await this.prisma.riskScore.findFirst({
                where: { userId, category },
                orderBy: { createdAt: 'desc' },
            });
            if (score) {
                latestScores.push(score);
            }
        }

        return latestScores;
    }

    /**
     * Get risk score history
     */
    async getRiskHistory(
        userId: string,
        options?: { category?: string; days?: number; limit?: number }
    ): Promise<RiskScore[]> {
        const since = new Date();
        since.setDate(since.getDate() - (options?.days || 30));

        return this.prisma.riskScore.findMany({
            where: {
                userId,
                ...(options?.category && { category: options.category }),
                createdAt: { gte: since },
            },
            orderBy: { createdAt: 'desc' },
            take: options?.limit || 30,
        });
    }

    /**
     * Get a specific risk score
     */
    async getRiskScoreById(userId: string, scoreId: string): Promise<RiskScore> {
        const score = await this.prisma.riskScore.findFirst({
            where: { id: scoreId, userId },
            include: { modelVersion: true },
        });

        if (!score) {
            throw new NotFoundException('Risk score not found');
        }

        return score;
    }

    /**
     * Calculate new risk scores for a user
     */
    async calculateRiskScores(userId: string): Promise<RiskScore[]> {
        // Get active model version
        const activeModel = await this.prisma.riskModelVersion.findFirst({
            where: { isActive: true },
        });

        if (!activeModel) {
            // Create default model if none exists
            await this.ensureDefaultModel();
            return this.calculateRiskScores(userId);
        }

        // Get user's recent daily aggregates (last 14 days)
        const since = new Date();
        since.setDate(since.getDate() - 14);

        const aggregates = await this.prisma.dailyAggregate.findMany({
            where: {
                userId,
                date: { gte: since },
            },
            orderBy: { date: 'desc' },
        });

        if (aggregates.length === 0) {
            return [];
        }

        // Calculate risks for each category
        const categoryResults = this.calculateCategoryRisks(aggregates);

        // Store risk scores
        const scores: RiskScore[] = [];

        for (const result of categoryResults) {
            const score = await this.prisma.riskScore.create({
                data: {
                    userId,
                    modelVersionId: activeModel.id,
                    category: result.category,
                    level: result.level as RiskLevel,
                    score: result.score,
                    confidence: result.confidence,
                    factors: result.factors as any,
                },
            });
            scores.push(score);
        }

        // Log model evidence
        await this.logModelEvidence(activeModel.id, aggregates, categoryResults);

        // Generate insight if high risk detected
        const highRiskResults = categoryResults.filter(r => r.level === 'HIGH');
        if (highRiskResults.length > 0) {
            await this.generateRiskInsight(userId, highRiskResults);
        }

        return scores;
    }

    /**
     * Get explainability output for a risk score
     */
    async getExplanation(userId: string, scoreId: string): Promise<RiskExplanation> {
        const score = await this.getRiskScoreById(userId, scoreId);
        const factors = score.factors as RiskFactor[];

        // Get historical scores for trend
        const history = await this.getRiskHistory(userId, {
            category: score.category,
            days: 14,
            limit: 2
        });

        let trend: RiskExplanation['trend'];
        if (history.length >= 2) {
            const current = history[0].score;
            const previous = history[1].score;
            const change = previous - current;

            trend = {
                direction: Math.abs(change) < 5 ? 'stable' : change > 0 ? 'improving' : 'declining',
                change: Math.abs(Math.round(change)),
                period: 'over the last 7 days',
            };
        }

        const categoryNames: Record<string, string> = {
            OVERALL_WELLNESS: 'Overall Wellness',
            CARDIOVASCULAR: 'Cardiovascular Health',
            SLEEP_QUALITY: 'Sleep Quality',
            ACTIVITY_LEVEL: 'Activity Level',
        };

        const levelDescriptions: Record<string, string> = {
            LOW: 'Your indicators are in a healthy range.',
            MEDIUM: 'Some areas could benefit from attention.',
            HIGH: 'Several factors warrant focused improvement.',
        };

        return {
            summary: `${categoryNames[score.category] || score.category}: ${levelDescriptions[score.level]}`,
            primaryFactors: factors.slice(0, 3).map(f => ({
                factor: f,
                explanation: f.description,
                recommendation: this.getRecommendation(f.name),
            })),
            trend,
            disclaimer: DISCLAIMER,
        };
    }

    /**
     * Calculate category-specific risks
     */
    private calculateCategoryRisks(aggregates: any[]): CategoryRiskResult[] {
        const results: CategoryRiskResult[] = [];

        // Cardiovascular
        results.push(this.calculateCardiovascularRisk(aggregates));

        // Sleep
        results.push(this.calculateSleepRisk(aggregates));

        // Activity
        results.push(this.calculateActivityRisk(aggregates));

        // Overall (aggregate)
        results.push(this.calculateOverallWellness(results));

        return results;
    }

    private calculateCardiovascularRisk(aggregates: any[]): CategoryRiskResult {
        const factors: RiskFactor[] = [];
        let score = 30;

        const restingHRs = aggregates
            .map((a: any) => a.restingHeartRate)
            .filter((hr: any): hr is number => hr !== null);

        if (restingHRs.length > 0) {
            const avgRestingHR = restingHRs.reduce((a: number, b: number) => a + b, 0) / restingHRs.length;

            if (avgRestingHR > 80) {
                score += 20;
                factors.push({
                    name: 'Elevated Resting Heart Rate',
                    contribution: 0.4,
                    description: `Average resting HR of ${Math.round(avgRestingHR)} bpm is above optimal`,
                });
            } else if (avgRestingHR >= 60 && avgRestingHR <= 70) {
                score -= 10;
                factors.push({
                    name: 'Healthy Resting Heart Rate',
                    contribution: -0.2,
                    description: `Average resting HR of ${Math.round(avgRestingHR)} bpm is optimal`,
                });
            }
        }

        return {
            category: 'CARDIOVASCULAR',
            score: Math.max(0, Math.min(100, score)),
            level: this.getRiskLevel(score),
            confidence: Math.min(0.9, aggregates.length / 14),
            factors,
        };
    }

    private calculateSleepRisk(aggregates: any[]): CategoryRiskResult {
        const factors: RiskFactor[] = [];
        let score = 25;

        const sleepDurations = aggregates.map((a: any) => a.sleepDuration);
        const avgSleep = sleepDurations.reduce((a: number, b: number) => a + b, 0) / sleepDurations.length;

        if (avgSleep < 360) {
            score += 25;
            factors.push({
                name: 'Insufficient Sleep',
                contribution: 0.5,
                description: `Average sleep of ${Math.round(avgSleep / 60)} hours is below recommended`,
            });
        } else if (avgSleep >= 420 && avgSleep <= 540) {
            score -= 15;
            factors.push({
                name: 'Optimal Sleep Duration',
                contribution: -0.3,
                description: `Average sleep of ${(avgSleep / 60).toFixed(1)} hours is healthy`,
            });
        }

        return {
            category: 'SLEEP_QUALITY',
            score: Math.max(0, Math.min(100, score)),
            level: this.getRiskLevel(score),
            confidence: Math.min(0.9, aggregates.length / 14),
            factors,
        };
    }

    private calculateActivityRisk(aggregates: any[]): CategoryRiskResult {
        const factors: RiskFactor[] = [];
        let score = 30;

        const avgSteps = aggregates.reduce((s: number, a: any) => s + a.steps, 0) / aggregates.length;

        if (avgSteps < 5000) {
            score += 20;
            factors.push({
                name: 'Low Activity',
                contribution: 0.4,
                description: `Average of ${Math.round(avgSteps).toLocaleString()} steps/day is below recommended`,
            });
        } else if (avgSteps >= 10000) {
            score -= 20;
            factors.push({
                name: 'Excellent Activity',
                contribution: -0.4,
                description: `Average of ${Math.round(avgSteps).toLocaleString()} steps/day exceeds goals`,
            });
        }

        return {
            category: 'ACTIVITY_LEVEL',
            score: Math.max(0, Math.min(100, score)),
            level: this.getRiskLevel(score),
            confidence: Math.min(0.9, aggregates.length / 14),
            factors,
        };
    }

    private calculateOverallWellness(categoryResults: CategoryRiskResult[]): CategoryRiskResult {
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
            allFactors.push(...result.factors.slice(0, 1));
        }

        const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 50;

        return {
            category: 'OVERALL_WELLNESS',
            score: Math.round(overallScore),
            level: this.getRiskLevel(overallScore),
            confidence: minConfidence,
            factors: allFactors.slice(0, 3),
        };
    }

    private getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
        if (score <= RISK_THRESHOLDS.low.max) return 'LOW';
        if (score <= RISK_THRESHOLDS.medium.max) return 'MEDIUM';
        return 'HIGH';
    }

    private getRecommendation(factorName: string): string | undefined {
        const recommendations: Record<string, string> = {
            'Low Activity': 'Try to add a 10-minute walk to your daily routine.',
            'Insufficient Sleep': 'Aim to get to bed 30 minutes earlier tonight.',
            'Elevated Resting Heart Rate': 'Consider incorporating relaxation techniques.',
        };
        return recommendations[factorName];
    }

    private async ensureDefaultModel(): Promise<void> {
        const existing = await this.prisma.riskModelVersion.findFirst();
        if (!existing) {
            await this.prisma.riskModelVersion.create({
                data: {
                    version: 'v1.0.0',
                    modelType: 'rule_based',
                    description: 'Initial rule-based risk model',
                    config: { weights: { activity: 0.3, sleep: 0.35, cardiovascular: 0.35 } },
                    isActive: true,
                    deployedAt: new Date(),
                },
            });
        }
    }

    private async logModelEvidence(
        modelVersionId: string,
        aggregates: any[],
        results: CategoryRiskResult[]
    ): Promise<void> {
        const inputHash = require('crypto')
            .createHash('sha256')
            .update(JSON.stringify({ count: aggregates.length }))
            .digest('hex')
            .substring(0, 16);

        await this.prisma.modelEvidenceLog.create({
            data: {
                modelVersionId,
                inputHash,
                inputSummary: {
                    dataPointCount: aggregates.length,
                    avgSteps: Math.round(aggregates.reduce((s, a) => s + a.steps, 0) / aggregates.length),
                },
                outputSummary: {
                    categories: results.map(r => ({ category: r.category, score: r.score, level: r.level })),
                },
            },
        });
    }

    private async generateRiskInsight(
        userId: string,
        highRiskResults: CategoryRiskResult[]
    ): Promise<void> {
        const topRisk = highRiskResults[0];
        const categoryNames: Record<string, string> = {
            CARDIOVASCULAR: 'cardiovascular health',
            SLEEP_QUALITY: 'sleep quality',
            ACTIVITY_LEVEL: 'activity level',
        };

        await this.prisma.insight.create({
            data: {
                userId,
                type: 'RISK',
                title: 'Health Insight',
                description: `Your ${categoryNames[topRisk.category] || topRisk.category} indicators suggest areas for improvement. ${DISCLAIMER}`,
                priority: 'HIGH',
                actionable: true,
                actionType: 'VIEW_INSIGHTS',
                actionTarget: '/insights',
            },
        });

        await this.notificationsService.createNotification(
            userId,
            'INSIGHT',
            'Health Insight Available',
            'New personalized health insights are ready for you.',
            { type: 'risk_insight' }
        );
    }
}
