import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { RemindersScheduler } from './reminders.scheduler';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule, ScheduleModule.forRoot()],
    controllers: [RemindersController],
    providers: [RemindersService, RemindersScheduler],
    exports: [RemindersService],
})
export class RemindersModule { }
