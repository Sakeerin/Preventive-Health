import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import { CareNetworkService } from './care-network.service';
import { GranteeType } from '@preventive-health/database';

// Placeholder for authentication
const MOCK_USER_ID = 'mock-user-id';

@Controller('share-grants')
export class ShareGrantsController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    /**
     * Get user's share grants
     */
    @Get()
    async getShareGrants(@Query('includeExpired') includeExpired?: string) {
        const userId = MOCK_USER_ID;
        const grants = await this.careNetworkService.getUserShareGrants(
            userId,
            includeExpired === 'true'
        );
        return {
            success: true,
            data: grants,
        };
    }

    /**
     * Get grant details
     */
    @Get(':id')
    async getShareGrant(@Param('id') id: string) {
        const userId = MOCK_USER_ID;
        const grant = await this.careNetworkService.getShareGrantById(userId, id);
        return {
            success: true,
            data: grant,
        };
    }

    /**
     * Create new share grant
     */
    @Post()
    async createShareGrant(
        @Body() body: {
            granteeId: string;
            granteeType: GranteeType;
            dataTypes: string[];
            expiresAt?: string;
            durationDays?: number;
        }
    ) {
        const userId = MOCK_USER_ID;
        const grant = await this.careNetworkService.createShareGrant(userId, body);
        return {
            success: true,
            data: grant,
            message: 'Access granted successfully',
        };
    }

    /**
     * Revoke share grant
     */
    @Post(':id/revoke')
    async revokeShareGrant(@Param('id') id: string) {
        const userId = MOCK_USER_ID;
        const grant = await this.careNetworkService.revokeShareGrant(userId, id);
        return {
            success: true,
            data: grant,
            message: 'Access revoked successfully',
        };
    }
}

@Controller('audit-logs')
export class AuditLogsController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    /**
     * Get user's audit logs
     */
    @Get()
    async getAuditLogs(
        @Query('action') action?: string,
        @Query('resource') resource?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const userId = MOCK_USER_ID;
        const result = await this.careNetworkService.getAuditLogs(userId, {
            action,
            resource,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        return {
            success: true,
            data: result.logs,
            pagination: result.pagination,
        };
    }
}
