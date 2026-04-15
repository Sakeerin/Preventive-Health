import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CareNetworkService } from './care-network.service';
import { GranteeType } from '@preventive-health/database';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';

@Controller('share-grants')
@UseGuards(SessionAuthGuard)
export class ShareGrantsController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    /**
     * Get user's share grants
     */
    @Get()
    async getShareGrants(
        @CurrentUser() user: AuthenticatedUser,
        @Query('includeExpired') includeExpired?: string
    ) {
        const grants = await this.careNetworkService.getUserShareGrants(
            user.id,
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
    async getShareGrant(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        const grant = await this.careNetworkService.getShareGrantById(user.id, id);
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
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: {
            granteeId: string;
            granteeType: GranteeType;
            dataTypes: string[];
            expiresAt?: string;
            durationDays?: number;
        }
    ) {
        const grant = await this.careNetworkService.createShareGrant(user.id, body);
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
    async revokeShareGrant(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        const grant = await this.careNetworkService.revokeShareGrant(user.id, id);
        return {
            success: true,
            data: grant,
            message: 'Access revoked successfully',
        };
    }
}

@Controller('audit-logs')
@UseGuards(SessionAuthGuard)
export class AuditLogsController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    /**
     * Get user's audit logs
     */
    @Get()
    async getAuditLogs(
        @CurrentUser() user: AuthenticatedUser,
        @Query('action') action?: string,
        @Query('resource') resource?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const result = await this.careNetworkService.getAuditLogs(user.id, {
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
