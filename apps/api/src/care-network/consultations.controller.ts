import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CareNetworkService } from './care-network.service';
import { ThreadStatus } from '@preventive-health/database';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';

@Controller('consultations')
@UseGuards(SessionAuthGuard)
export class ConsultationsController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    /**
     * Get user's consultation threads
     */
    @Get()
    async getThreads(
        @CurrentUser() user: AuthenticatedUser,
        @Query('status') status?: string
    ) {
        const threads = await this.careNetworkService.getUserThreads(
            user.id,
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
    async getThread(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        const thread = await this.careNetworkService.getThreadById(user.id, id);
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
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: {
            providerId: string;
            subject?: string;
            initialMessage?: string;
        }
    ) {
        const thread = await this.careNetworkService.createThread(user.id, body);
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
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() body: { content: string }
    ) {
        const message = await this.careNetworkService.sendMessage(user.id, id, body.content);
        return {
            success: true,
            data: message,
        };
    }

    /**
     * Close consultation thread
     */
    @Patch(':id/close')
    async closeThread(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        const thread = await this.careNetworkService.closeThread(user.id, id);
        return {
            success: true,
            data: thread,
            message: 'Consultation closed',
        };
    }
}
