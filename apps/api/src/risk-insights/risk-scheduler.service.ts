import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@preventive-health/database';
import { RiskInsightsService } from './risk-insights.service';

@Injectable()
export class RiskSchedulerService {
    private readonly logger = new Logger(RiskSchedulerService.name);

    constructor(
        private readonly prisma: PrismaClient,
        private readonly riskInsightsService: RiskInsightsService
    ) { }

    /**
     * Daily risk recalculation for active users
     * Runs every day at 6:00 AM
     */
    @Cron('0 6 * * *')
    async handleDailyRiskCalculation(): Promise<void> {
        this.logger.log('Starting daily risk calculation...');

        try {
            // Get users who have synced data in the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const activeUsers = await this.prisma.dailyAggregate.groupBy({
                by: ['userId'],
                where: {
                    date: { gte: sevenDaysAgo },
                },
            });

            this.logger.log(`Found ${activeUsers.length} active users for risk calculation`);

            let successCount = 0;
            let errorCount = 0;

            for (const user of activeUsers) {
                try {
                    await this.riskInsightsService.calculateRiskScores(user.userId);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    this.logger.error(`Failed to calculate risk for user ${user.userId}:`, error);
                }
            }

            this.logger.log(
                `Daily risk calculation complete. Success: ${successCount}, Errors: ${errorCount}`
            );
        } catch (error) {
            this.logger.error('Daily risk calculation failed:', error);
        }
    }

    /**
     * Cleanup old risk scores
     * Runs every Sunday at 2:00 AM
     */
    @Cron('0 2 * * 0')
    async handleCleanup(): Promise<void> {
        this.logger.log('Starting risk score cleanup...');

        try {
            // Keep last 90 days of risk scores
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);

            // Only delete if there are newer scores to preserve history
            const result = await this.prisma.riskScore.deleteMany({
                where: {
                    createdAt: { lt: cutoffDate },
                },
            });

            this.logger.log(`Cleaned up ${result.count} old risk scores`);

            // Cleanup old model evidence logs (keep 30 days)
            const evidenceCutoff = new Date();
            evidenceCutoff.setDate(evidenceCutoff.getDate() - 30);

            const evidenceResult = await this.prisma.modelEvidenceLog.deleteMany({
                where: {
                    createdAt: { lt: evidenceCutoff },
                },
            });

            this.logger.log(`Cleaned up ${evidenceResult.count} old model evidence logs`);
        } catch (error) {
            this.logger.error('Risk score cleanup failed:', error);
        }
    }

    /**
     * Check for model drift
     * Runs every day at 3:00 AM
     */
    @Cron('0 3 * * *')
    async handleDriftCheck(): Promise<void> {
        this.logger.log('Starting model drift check...');

        try {
            const activeModel = await this.prisma.riskModelVersion.findFirst({
                where: { isActive: true },
            });

            if (!activeModel) {
                this.logger.warn('No active model found for drift check');
                return;
            }

            // Get recent evidence logs
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const recentLogs = await this.prisma.modelEvidenceLog.findMany({
                where: {
                    modelVersionId: activeModel.id,
                    createdAt: { gte: yesterday },
                },
            });

            if (recentLogs.length === 0) {
                this.logger.log('No recent model evidence for drift analysis');
                return;
            }

            // Calculate average drift score
            const driftScores = recentLogs
                .map(log => log.driftScore)
                .filter((score): score is number => score !== null);

            if (driftScores.length > 0) {
                const avgDrift = driftScores.reduce((a, b) => a + b, 0) / driftScores.length;

                if (avgDrift > 0.7) {
                    this.logger.warn(`High model drift detected: ${avgDrift.toFixed(2)}`);
                    // TODO: Send alert to admin
                } else {
                    this.logger.log(`Model drift within normal range: ${avgDrift.toFixed(2)}`);
                }
            }
        } catch (error) {
            this.logger.error('Model drift check failed:', error);
        }
    }
}
