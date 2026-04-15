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
import { RemindersService } from './reminders.service';
import { createReminderSchema, updateReminderSchema } from '@preventive-health/shared';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';

@Controller('reminders')
@UseGuards(SessionAuthGuard)
export class RemindersController {
    constructor(private readonly remindersService: RemindersService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createReminder(
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: unknown
    ) {
        const validated = createReminderSchema.parse(body);
        return this.remindersService.createReminder(user.id, validated);
    }

    @Get()
    async getReminders(
        @CurrentUser() user: AuthenticatedUser,
        @Query('activeOnly') activeOnly?: string
    ) {
        return this.remindersService.getReminders(user.id, {
            activeOnly: activeOnly === 'true',
        });
    }

    @Get(':id')
    async getReminder(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        return this.remindersService.getReminderById(user.id, id);
    }

    @Patch(':id')
    async updateReminder(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() body: unknown
    ) {
        const validated = updateReminderSchema.parse(body);
        return this.remindersService.updateReminder(user.id, id, validated);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteReminder(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        await this.remindersService.deleteReminder(user.id, id);
    }
}
