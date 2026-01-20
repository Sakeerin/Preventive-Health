import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RiskInsightsController } from './risk-insights.controller';
import { RiskInsightsService } from './risk-insights.service';
import { RiskSchedulerService } from './risk-scheduler.service';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications';

@Module({
    imports: [DatabaseModule, ScheduleModule.forRoot(), NotificationsModule],
    controllers: [RiskInsightsController],
    providers: [RiskInsightsService, RiskSchedulerService],
    exports: [RiskInsightsService],
})
export class RiskInsightsModule { }
