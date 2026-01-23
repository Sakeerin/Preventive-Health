import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import { CareNetworkService } from './care-network.service';
import { ThreadStatus } from '@preventive-health/database';

// Placeholder for authentication
const MOCK_USER_ID = 'mock-user-id';

@Controller('consultations')
export class ConsultationsController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    /**
     * Get user's consultation threads
     */
    @Get()
    async getThreads(@Query('status') status?: string) {
        const userId = MOCK_USER_ID;
        const threads = await this.careNetworkService.getUserThreads(
            userId,
            status as ThreadStatus
        );
        return {
            success: true,
            data: threads,
        };
    }

    /**
     * Get thread with messages
     */
    @Get(':id')
    async getThread(@Param('id') id: string) {
        const userId = MOCK_USER_ID;
        const thread = await this.careNetworkService.getThreadById(userId, id);
        return {
            success: true,
            data: thread,
        };
    }

    /**
     * Start new consultation thread
     */
    @Post()
    async createThread(
        @Body() body: {
            providerId: string;
            subject?: string;
            initialMessage?: string;
        }
    ) {
        const userId = MOCK_USER_ID;
        const thread = await this.careNetworkService.createThread(userId, body);
        return {
            success: true,
            data: thread,
            message: 'Consultation started successfully',
        };
    }

    /**
     * Send message in thread
     */
    @Post(':id/messages')
    async sendMessage(
        @Param('id') id: string,
        @Body() body: { content: string }
    ) {
        const userId = MOCK_USER_ID;
        const message = await this.careNetworkService.sendMessage(userId, id, body.content);
        return {
            success: true,
            data: message,
        };
    }

    /**
     * Close consultation thread
     */
    @Patch(':id/close')
    async closeThread(@Param('id') id: string) {
        const userId = MOCK_USER_ID;
        const thread = await this.careNetworkService.closeThread(userId, id);
        return {
            success: true,
            data: thread,
            message: 'Consultation closed',
        };
    }
}
