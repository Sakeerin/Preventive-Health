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
    UseGuards,
} from '@nestjs/common';
import { HealthService } from './health.service';
import { CreateMeasurementsDto } from './dto/create-measurements.dto';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';
import { createMeasurementSchema, metricTypeSchema } from '@preventive-health/shared';

@Controller('api/health')
@UseGuards(SessionAuthGuard)
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    /**
     * Upload health measurements from mobile device
     * Supports idempotency via Idempotency-Key header
     */
    @Post('measurements')
    @HttpCode(HttpStatus.CREATED)
    async createMeasurements(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateMeasurementsDto,
        @Headers('idempotency-key') idempotencyKey?: string
    ) {
        if (!dto.measurements || dto.measurements.length === 0) {
            throw new BadRequestException('No measurements provided');
        }

        const normalizedMeasurements = dto.measurements.map((measurement) => {
            const parsedType = metricTypeSchema.safeParse(measurement.type);
            if (!parsedType.success) {
                throw new BadRequestException(`Unsupported metric type: ${measurement.type}`);
            }

            const parsedMeasurement = createMeasurementSchema.safeParse({
                ...measurement,
                userId: user.id,
                recordedAt: new Date(measurement.recordedAt),
            });

            if (!parsedMeasurement.success) {
                throw new BadRequestException(parsedMeasurement.error.flatten());
            }

            return {
                ...measurement,
                type: parsedType.data,
                recordedAt: new Date(measurement.recordedAt).toISOString(),
            };
        });

        // Check idempotency
        if (idempotencyKey) {
            const existing = await this.healthService.checkIdempotency(
                user.id,
                idempotencyKey
            );
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
            user.id,
            normalizedMeasurements,
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
        @CurrentUser() user: AuthenticatedUser,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate?: string
    ) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = endDate ? new Date(endDate) : undefined;

        if (Number.isNaN(parsedStartDate.getTime())) {
            throw new BadRequestException('startDate must be a valid ISO date');
        }

        if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
            throw new BadRequestException('endDate must be a valid ISO date');
        }

        if (parsedEndDate && parsedEndDate < parsedStartDate) {
            throw new BadRequestException('endDate must be greater than or equal to startDate');
        }

        const aggregates = await this.healthService.getDailyAggregates(
            user.id,
            parsedStartDate,
            parsedEndDate
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
        @CurrentUser() user: AuthenticatedUser,
        @Query('type') type: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limit?: string
    ) {
        const parsedType = metricTypeSchema.safeParse(type);
        if (!parsedType.success) {
            throw new BadRequestException(`Unsupported metric type: ${type}`);
        }

        const parsedStartDate = new Date(startDate);
        const parsedEndDate = endDate ? new Date(endDate) : undefined;
        const parsedLimit = limit ? Number(limit) : undefined;

        if (Number.isNaN(parsedStartDate.getTime())) {
            throw new BadRequestException('startDate must be a valid ISO date');
        }

        if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
            throw new BadRequestException('endDate must be a valid ISO date');
        }

        if (parsedEndDate && parsedEndDate < parsedStartDate) {
            throw new BadRequestException('endDate must be greater than or equal to startDate');
        }

        if (
            parsedLimit !== undefined &&
            (!Number.isInteger(parsedLimit) || parsedLimit <= 0 || parsedLimit > 500)
        ) {
            throw new BadRequestException('limit must be an integer between 1 and 500');
        }

        const measurements = await this.healthService.getMeasurements(
            user.id,
            parsedType.data,
            parsedStartDate,
            parsedEndDate,
            parsedLimit
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
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: { date: string }
    ) {
        const parsedDate = new Date(body.date);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new BadRequestException('date must be a valid ISO date');
        }

        const aggregate = await this.healthService.computeDailyAggregate(
            user.id,
            parsedDate
        );

        return {
            success: true,
            data: aggregate,
        };
    }
}
