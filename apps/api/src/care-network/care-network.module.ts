import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { BookingsController } from './bookings.controller';
import { ConsultationsController } from './consultations.controller';
import { ShareGrantsController, AuditLogsController } from './share-grants.controller';
import { CareNetworkService } from './care-network.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [
        ProvidersController,
        BookingsController,
        ConsultationsController,
        ShareGrantsController,
        AuditLogsController,
    ],
    providers: [CareNetworkService],
    exports: [CareNetworkService],
})
export class CareNetworkModule { }
