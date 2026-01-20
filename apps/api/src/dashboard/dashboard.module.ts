import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { WeeklySummaryService } from './weekly-summary.service';
import { NotificationsModule } from '../notifications';
import { DatabaseModule } from '../database';

@Module({
    imports: [ScheduleModule.forRoot(), NotificationsModule, DatabaseModule],
    controllers: [DashboardController],
    providers: [DashboardService, WeeklySummaryService],
    exports: [DashboardService, WeeklySummaryService],
})
export class DashboardModule { }

