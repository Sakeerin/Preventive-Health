import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { RiskInsightsService } from './risk-insights.service';

// Placeholder for authentication
const MOCK_USER_ID = 'mock-user-id';

@Controller('risk-insights')
export class RiskInsightsController {
    constructor(private readonly riskInsightsService: RiskInsightsService) { }

    /**
     * Get latest risk scores for the current user
     */
    @Get()
    async getLatestRiskScores() {
        const userId = MOCK_USER_ID; // Replace with auth
        const scores = await this.riskInsightsService.getLatestRiskScores(userId);
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
        @Query('category') category?: string,
        @Query('days') days?: string,
        @Query('limit') limit?: string
    ) {
        const userId = MOCK_USER_ID;
        const history = await this.riskInsightsService.getRiskHistory(userId, {
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
    async calculateRiskScores() {
        const userId = MOCK_USER_ID;
        const scores = await this.riskInsightsService.calculateRiskScores(userId);
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
    async getRiskScore(@Param('id') id: string) {
        const userId = MOCK_USER_ID;
        const score = await this.riskInsightsService.getRiskScoreById(userId, id);
        return {
            success: true,
            data: score,
        };
    }

    /**
     * Get explainability output for a risk score
     */
    @Get(':id/explain')
    async getExplanation(@Param('id') id: string) {
        const userId = MOCK_USER_ID;
        const explanation = await this.riskInsightsService.getExplanation(userId, id);
        return {
            success: true,
            data: explanation,
        };
    }
}
