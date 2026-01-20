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
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { createGoalSchema, updateGoalSchema } from '@preventive-health/shared';
import { GoalType } from '@preventive-health/database';

// TODO: Replace with actual auth decorator
const MOCK_USER_ID = 'mock-user-id';

@Controller('goals')
export class GoalsController {
    constructor(private readonly goalsService: GoalsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createGoal(@Body() body: unknown) {
        const validated = createGoalSchema.parse(body);
        return this.goalsService.createGoal(MOCK_USER_ID, validated);
    }

    @Get()
    async getGoals(
        @Query('activeOnly') activeOnly?: string,
        @Query('type') type?: GoalType
    ) {
        return this.goalsService.getGoals(MOCK_USER_ID, {
            activeOnly: activeOnly === 'true',
            type,
        });
    }

    @Get('progress')
    async getGoalProgress() {
        return this.goalsService.getGoalProgress(MOCK_USER_ID);
    }

    @Get(':id')
    async getGoal(@Param('id') id: string) {
        return this.goalsService.getGoalById(MOCK_USER_ID, id);
    }

    @Patch(':id')
    async updateGoal(@Param('id') id: string, @Body() body: unknown) {
        const validated = updateGoalSchema.parse(body);
        return this.goalsService.updateGoal(MOCK_USER_ID, id, validated);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteGoal(@Param('id') id: string) {
        await this.goalsService.deleteGoal(MOCK_USER_ID, id);
    }
}
