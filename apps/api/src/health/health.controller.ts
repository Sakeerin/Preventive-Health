import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Headers,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { HealthService } from './health.service';
import { CreateMeasurementsDto } from './dto/create-measurements.dto';

@Controller('api/health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    /**
     * Upload health measurements from mobile device
     * Supports idempotency via Idempotency-Key header
     */
    @Post('measurements')
    @HttpCode(HttpStatus.CREATED)
    async createMeasurements(
        @Body() dto: CreateMeasurementsDto,
        @Headers('idempotency-key') idempotencyKey?: string
    ) {
        if (!dto.measurements || dto.measurements.length === 0) {
            throw new BadRequestException('No measurements provided');
        }

        // Check idempotency
        if (idempotencyKey) {
            const existing = await this.healthService.checkIdempotency(idempotencyKey);
            if (existing) {
                return {
                    success: true,
                    message: 'Measurements already processed',
                    count: existing.count,
                    idempotencyKey,
                };
            }
        }

        const result = await this.healthService.createMeasurements(
            dto.measurements,
            idempotencyKey
        );

        return {
            success: true,
            message: 'Measurements saved successfully',
            count: result.count,
            idempotencyKey,
        };
    }

    /**
     * Get daily aggregates for a user
     */
    @Get('daily-aggregates')
    async getDailyAggregates(
        @Query('userId') userId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate?: string
    ) {
        if (!userId || !startDate) {
            throw new BadRequestException('userId and startDate are required');
        }

        const aggregates = await this.healthService.getDailyAggregates(
            userId,
            new Date(startDate),
            endDate ? new Date(endDate) : undefined
        );

        return {
            success: true,
            data: aggregates,
        };
    }

    /**
     * Get measurements for a user and metric type
     */
    @Get('measurements')
    async getMeasurements(
        @Query('userId') userId: string,
        @Query('type') type: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limit?: string
    ) {
        if (!userId || !type || !startDate) {
            throw new BadRequestException('userId, type, and startDate are required');
        }

        const measurements = await this.healthService.getMeasurements(
            userId,
            type,
            new Date(startDate),
            endDate ? new Date(endDate) : undefined,
            limit ? parseInt(limit, 10) : undefined
        );

        return {
            success: true,
            data: measurements,
        };
    }

    /**
     * Trigger daily aggregate computation
     */
    @Post('compute-aggregates')
    @HttpCode(HttpStatus.OK)
    async computeAggregates(
        @Body() body: { userId: string; date: string }
    ) {
        if (!body.userId || !body.date) {
            throw new BadRequestException('userId and date are required');
        }

        const aggregate = await this.healthService.computeDailyAggregate(
            body.userId,
            new Date(body.date)
        );

        return {
            success: true,
            data: aggregate,
        };
    }
}
