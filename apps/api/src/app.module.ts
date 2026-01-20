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

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        DatabaseModule,
        HealthModule,
        DashboardModule,
        GoalsModule,
        RemindersModule,
        NotificationsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }

