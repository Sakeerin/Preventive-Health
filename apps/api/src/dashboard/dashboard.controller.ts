import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';

@Controller('api/dashboard')
@UseGuards(SessionAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    /**
     * Get dashboard summary for a user
     */
    @Get('summary')
    async getDashboardSummary(@CurrentUser() user: AuthenticatedUser) {
        const summary = await this.dashboardService.getDashboardSummary(user.id);

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
    async computeAggregate(
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: unknown
    ) {
        const dateInput =
            body && typeof body === 'object' && 'date' in body
                ? (body as { date?: string }).date
                : undefined;

        const date = dateInput ? new Date(dateInput) : new Date();
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException('date must be a valid ISO date');
        }

        await this.dashboardService.computeDailyAggregate(user.id, date);

        return {
            success: true,
            message: 'Daily aggregate computed successfully',
        };
    }
}
