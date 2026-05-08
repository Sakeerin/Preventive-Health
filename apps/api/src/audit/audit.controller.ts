import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard, SessionAuthGuard } from '../auth';

interface AuditQuery {
    page?: string;
    limit?: string;
    userId?: string;
    action?: string;
    resource?: string;
}

@Controller('audit')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('admin')
export class AuditController {
    @Get()
    getAuditLogs(@Query() query: AuditQuery) {
        // Mocked audit logs
        return {
            data: [
                {
                    id: '1',
                    userId: 'usr-123',
                    action: 'USER_LOGIN',
                    resource: 'AUTH',
                    ipAddress: '192.168.1.1',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    userId: 'prov-456',
                    action: 'RISK_SCORE_VIEWED',
                    resource: 'RiskScore',
                    ipAddress: '10.0.0.5',
                    createdAt: new Date().toISOString()
                }
            ],
            total: 2,
            page: query.page ? parseInt(query.page, 10) : 1,
            limit: query.limit ? Math.min(parseInt(query.limit, 10), 100) : 20
        };
    }
}
