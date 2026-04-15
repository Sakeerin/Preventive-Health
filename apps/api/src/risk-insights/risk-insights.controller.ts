import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { RiskInsightsService } from './risk-insights.service';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';

@Controller('risk-insights')
@UseGuards(SessionAuthGuard)
export class RiskInsightsController {
    constructor(private readonly riskInsightsService: RiskInsightsService) { }

    /**
     * Get latest risk scores for the current user
     */
    @Get()
    async getLatestRiskScores(@CurrentUser() user: AuthenticatedUser) {
        const scores = await this.riskInsightsService.getLatestRiskScores(user.id);
        return {
            success: true,
            data: scores,
        };
    }

    /**
     * Get risk score history
     */
    @Get('history')
    async getRiskHistory(
        @CurrentUser() user: AuthenticatedUser,
        @Query('category') category?: string,
        @Query('days') days?: string,
        @Query('limit') limit?: string
    ) {
        const history = await this.riskInsightsService.getRiskHistory(user.id, {
            category,
            days: days ? parseInt(days, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
        return {
            success: true,
            data: history,
        };
    }

    /**
     * Trigger new risk calculation
     */
    @Post('calculate')
    async calculateRiskScores(@CurrentUser() user: AuthenticatedUser) {
        const scores = await this.riskInsightsService.calculateRiskScores(user.id);
        return {
            success: true,
            data: scores,
            message: scores.length > 0
                ? 'Risk scores calculated successfully'
                : 'Insufficient data for risk calculation',
        };
    }

    /**
     * Get specific risk score
     */
    @Get(':id')
    async getRiskScore(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        const score = await this.riskInsightsService.getRiskScoreById(user.id, id);
        return {
            success: true,
            data: score,
        };
    }

    /**
     * Get explainability output for a risk score
     */
    @Get(':id/explain')
    async getExplanation(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        const explanation = await this.riskInsightsService.getExplanation(user.id, id);
        return {
            success: true,
            data: explanation,
        };
    }
}
