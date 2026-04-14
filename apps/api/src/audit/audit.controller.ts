import { Controller, Get, Query } from '@nestjs/common';

@Controller('audit')
export class AuditController {
    @Get()
    getAuditLogs(@Query() query: any) {
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
            page: query.page || 1,
            limit: query.limit || 20
        };
    }
}
