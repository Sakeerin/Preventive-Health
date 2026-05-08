import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { CareNetworkService } from './care-network.service';
import { Roles, RolesGuard, SessionAuthGuard } from '../auth';
import { ProviderType } from '@preventive-health/database';

const VALID_PROVIDER_TYPES = new Set<string>(Object.values(ProviderType));

@Controller('providers')
export class ProvidersController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    @Get()
    async getProviders(
        @Query('type') type?: string,
        @Query('specialty') specialty?: string,
        @Query('isVerified') isVerified?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ): Promise<{ success: boolean; data: unknown[]; pagination: unknown }> {
        if (type && !VALID_PROVIDER_TYPES.has(type.toUpperCase())) {
            throw new BadRequestException(`Invalid provider type: ${type}`);
        }

        const parsedPage = page ? parseInt(page, 10) : 1;
        const parsedLimit = limit ? parseInt(limit, 10) : 10;

        if (isNaN(parsedPage) || parsedPage < 1) {
            throw new BadRequestException('page must be a positive integer');
        }
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            throw new BadRequestException('limit must be between 1 and 100');
        }

        const result = await this.careNetworkService.getProviders({
            type: type ? (type.toUpperCase() as ProviderType) : undefined,
            specialty,
            isVerified: isVerified ? isVerified === 'true' : undefined,
            search,
            page: parsedPage,
            limit: parsedLimit,
        });
        return {
            success: true,
            data: result.providers,
            pagination: result.pagination,
        };
    }

    @Patch(':id/verify')
    @UseGuards(SessionAuthGuard, RolesGuard)
    @Roles('admin')
    async verifyProvider(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
        // Mock admin verification
        return {
            success: true,
            message: `Provider ${id} has been verified.`
        };
    }

    @Get(':id')
    async getProvider(@Param('id') id: string): Promise<{ success: boolean; data: unknown }> {
        const provider = await this.careNetworkService.getProviderById(id);
        return {
            success: true,
            data: provider,
        };
    }

    @Get(':id/availability')
    async getAvailability(
        @Param('id') id: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate?: string,
        @Query('duration') duration?: string
    ): Promise<{ success: boolean; data: unknown }> {
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
