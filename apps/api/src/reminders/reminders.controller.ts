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
import { RemindersService } from './reminders.service';
import { createReminderSchema, updateReminderSchema } from '@preventive-health/shared';

// TODO: Replace with actual auth decorator
const MOCK_USER_ID = 'mock-user-id';

@Controller('reminders')
export class RemindersController {
    constructor(private readonly remindersService: RemindersService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createReminder(@Body() body: unknown) {
        const validated = createReminderSchema.parse(body);
        return this.remindersService.createReminder(MOCK_USER_ID, validated);
    }

    @Get()
    async getReminders(@Query('activeOnly') activeOnly?: string) {
        return this.remindersService.getReminders(MOCK_USER_ID, {
            activeOnly: activeOnly === 'true',
        });
    }

    @Get(':id')
    async getReminder(@Param('id') id: string) {
        return this.remindersService.getReminderById(MOCK_USER_ID, id);
    }

    @Patch(':id')
    async updateReminder(@Param('id') id: string, @Body() body: unknown) {
        const validated = updateReminderSchema.parse(body);
        return this.remindersService.updateReminder(MOCK_USER_ID, id, validated);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteReminder(@Param('id') id: string) {
        await this.remindersService.deleteReminder(MOCK_USER_ID, id);
    }
}
