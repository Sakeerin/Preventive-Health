import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { SessionAuthGuard } from './session-auth.guard';

@Global()
@Module({
    imports: [DatabaseModule],
    providers: [AuthService, SessionAuthGuard, RolesGuard],
    exports: [AuthService, SessionAuthGuard, RolesGuard],
})
export class AuthModule { }
