import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database';
import { HealthModule } from './health';
import { DashboardModule } from './dashboard';
import { GoalsModule } from './goals';
import { RemindersModule } from './reminders';
import { NotificationsModule } from './notifications';
import { RiskInsightsModule } from './risk-insights';
import { CareNetworkModule } from './care-network';
import { AdminModule } from './admin';
import { ContentModule } from './content';
import { AuditModule } from './audit';
import { ExportModule } from './export';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        ThrottlerModule.forRoot([{
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per IP per minute
        }]),
        DatabaseModule,
        HealthModule,
        DashboardModule,
        GoalsModule,
        RemindersModule,
        NotificationsModule,
        RiskInsightsModule,
        CareNetworkModule,
        AdminModule,
        ContentModule,
        AuditModule,
        ExportModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        }
    ],
})
export class AppModule { }


