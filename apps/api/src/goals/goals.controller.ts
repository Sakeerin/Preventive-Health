import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { createGoalSchema, updateGoalSchema } from '@preventive-health/shared';
import { GoalType } from '@preventive-health/database';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';

@Controller('goals')
@UseGuards(SessionAuthGuard)
export class GoalsController {
    constructor(private readonly goalsService: GoalsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createGoal(
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: unknown
    ) {
        const validated = createGoalSchema.parse(body);
        return this.goalsService.createGoal(user.id, validated);
    }

    @Get()
    async getGoals(
        @CurrentUser() user: AuthenticatedUser,
        @Query('activeOnly') activeOnly?: string,
        @Query('type') type?: GoalType
    ) {
        return this.goalsService.getGoals(user.id, {
            activeOnly: activeOnly === 'true',
            type,
        });
    }

    @Get('progress')
    async getGoalProgress(@CurrentUser() user: AuthenticatedUser) {
        return this.goalsService.getGoalProgress(user.id);
    }

    @Get(':id')
    async getGoal(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        return this.goalsService.getGoalById(user.id, id);
    }

    @Patch(':id')
    async updateGoal(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() body: unknown
    ) {
        const validated = updateGoalSchema.parse(body);
        return this.goalsService.updateGoal(user.id, id, validated);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteGoal(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        await this.goalsService.deleteGoal(user.id, id);
    }
}
