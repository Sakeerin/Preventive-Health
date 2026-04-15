import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CareNetworkService } from './care-network.service';
import { BookingStatus, BookingType } from '@preventive-health/database';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';

@Controller('bookings')
@UseGuards(SessionAuthGuard)
export class BookingsController {
    constructor(private readonly careNetworkService: CareNetworkService) { }

    /**
     * Get user's bookings
     */
    @Get()
    async getBookings(
        @CurrentUser() user: AuthenticatedUser,
        @Query('status') status?: string
    ) {
        const bookings = await this.careNetworkService.getUserBookings(
            user.id,
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
    async getBooking(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        const booking = await this.careNetworkService.getBookingById(user.id, id);
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
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: {
            providerId: string;
            type: BookingType;
            scheduledAt: string;
            duration?: number;
            notes?: string;
        }
    ) {
        const booking = await this.careNetworkService.createBooking(user.id, body);
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
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() body: {
            status?: BookingStatus;
            scheduledAt?: string;
            notes?: string;
        }
    ) {
        const booking = await this.careNetworkService.updateBooking(user.id, id, body);
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
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() body: { reason?: string }
    ) {
        const booking = await this.careNetworkService.cancelBooking(user.id, id, body.reason);
        return {
            success: true,
            data: booking,
            message: 'Booking cancelled successfully',
        };
    }
}
