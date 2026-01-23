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

// Placeholder for authentication
const MOCK_USER_ID = 'mock-user-id';

@Controller('providers')
export class ProvidersController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    /**
     * List providers with optional filters
     */
    @Get()
    async getProviders(
        @Query('type') type?: string,
        @Query('specialty') specialty?: string,
        @Query('isVerified') isVerified?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const result = await this.careNetworkService.getProviders({
            type: type as any,
            specialty,
            isVerified: isVerified ? isVerified === 'true' : undefined,
            search,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        });
        return {
            success: true,
            data: result.providers,
            pagination: result.pagination,
        };
    }

    /**
     * Get provider details
     */
    @Get(':id')
    async getProvider(@Param('id') id: string) {
        const provider = await this.careNetworkService.getProviderById(id);
        return {
            success: true,
            data: provider,
        };
    }

    /**
     * Get provider availability slots
     */
    @Get(':id/availability')
    async getAvailability(
        @Param('id') id: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate?: string,
        @Query('duration') duration?: string
    ) {
        const availability = await this.careNetworkService.getProviderAvailability(
            id,
            startDate,
            endDate,
            duration ? parseInt(duration, 10) : 30
        );
        return {
            success: true,
            data: availability,
        };
    }
}
