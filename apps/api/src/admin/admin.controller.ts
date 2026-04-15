import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard, SessionAuthGuard } from '../auth';

@Controller('admin')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    @Get('stats')
    getAdminStats() {
        // Mocked admin dashboard statistics
        return {
            totalUsers: 1450,
            activeProviders: 42,
            pendingApprovals: 8,
            activeModels: 1,
            systemHealth: 'optimal'
        };
    }
}
