import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    /**
     * Get dashboard summary for a user
     */
    @Get('summary')
    async getDashboardSummary(@Query('userId') userId: string) {
        if (!userId) {
            throw new BadRequestException('userId is required');
        }

        const summary = await this.dashboardService.getDashboardSummary(userId);

        return {
            success: true,
            data: summary,
        };
    }

    /**
     * Trigger daily aggregate computation for a user
     */
    @Post('compute-aggregate')
    @HttpCode(HttpStatus.OK)
    async computeAggregate(@Body() body: { userId: string; date?: string }) {
        if (!body.userId) {
            throw new BadRequestException('userId is required');
        }

        const date = body.date ? new Date(body.date) : new Date();
        await this.dashboardService.computeDailyAggregate(body.userId, date);

        return {
            success: true,
            message: 'Daily aggregate computed successfully',
        };
    }
}
