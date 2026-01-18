import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getRoot(): { message: string } {
        return { message: 'Preventive Health API' };
    }

    @Get('health')
    getHealth(): { status: string; timestamp: string } {
        return this.appService.getHealth();
    }
}
