import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import { CareNetworkService } from './care-network.service';
import { BookingStatus, BookingType } from '@preventive-health/database';

// Placeholder for authentication
const MOCK_USER_ID = 'mock-user-id';

@Controller('bookings')
export class BookingsController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    /**
     * Get user's bookings
     */
    @Get()
    async getBookings(@Query('status') status?: string) {
        const userId = MOCK_USER_ID;
        const bookings = await this.careNetworkService.getUserBookings(
            userId,
            status as BookingStatus
        );
        return {
            success: true,
            data: bookings,
        };
    }

    /**
     * Get booking details
     */
    @Get(':id')
    async getBooking(@Param('id') id: string) {
        const userId = MOCK_USER_ID;
        const booking = await this.careNetworkService.getBookingById(userId, id);
        return {
            success: true,
            data: booking,
        };
    }

    /**
     * Create new booking
     */
    @Post()
    async createBooking(
        @Body() body: {
            providerId: string;
            type: BookingType;
            scheduledAt: string;
            duration?: number;
            notes?: string;
        }
    ) {
        const userId = MOCK_USER_ID;
        const booking = await this.careNetworkService.createBooking(userId, body);
        return {
            success: true,
            data: booking,
            message: 'Booking created successfully',
        };
    }

    /**
     * Update booking
     */
    @Patch(':id')
    async updateBooking(
        @Param('id') id: string,
        @Body() body: {
            status?: BookingStatus;
            scheduledAt?: string;
            notes?: string;
        }
    ) {
        const userId = MOCK_USER_ID;
        const booking = await this.careNetworkService.updateBooking(userId, id, body);
        return {
            success: true,
            data: booking,
            message: 'Booking updated successfully',
        };
    }

    /**
     * Cancel booking
     */
    @Post(':id/cancel')
    async cancelBooking(
        @Param('id') id: string,
        @Body() body: { reason?: string }
    ) {
        const userId = MOCK_USER_ID;
        const booking = await this.careNetworkService.cancelBooking(userId, id, body.reason);
        return {
            success: true,
            data: booking,
            message: 'Booking cancelled successfully',
        };
    }
}
