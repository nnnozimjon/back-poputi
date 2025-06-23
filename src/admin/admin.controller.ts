import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';
import { Request } from 'express';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    // Dashboard - Accessible by all admin roles
    @Get('dashboard')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR)
    getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    // User Management - Only Super Admin and Admin
    @Get('users')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Get('users/:id')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    getUserById(@Param('id') id: string) {
        return this.adminService.getUserById(id);
    }

    @Put('users/:id/status')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    updateUserStatus(
        @Param('id') id: string,
        @Body('status') status: 'active' | 'inactive' | 'blocked',
    ) {
        return this.adminService.updateUserStatus(id, status);
    }

    @Put('users/:id/roles')
    @Roles(Role.SUPER_ADMIN) // Only Super Admin can change roles
    updateUserRole(
        @Param('id') id: string,
        @Body('roles') roles: Role[],
    ) {
        return this.adminService.updateUserRole(id, roles);
    }

    // Trip Management - Accessible by all admin roles
    @Get('trips')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR)
    getAllTrips() {
        return this.adminService.getAllTrips();
    }

    @Get('trips/:id')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR)
    getTripById(@Param('id') id: string) {
        return this.adminService.getTripById(id);
    }

    @Put('trips/:id/status')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN) // Only Super Admin and Admin can change trip status
    updateTripStatus(
        @Param('id') id: string,
        @Body('status') status: 'scheduled' | 'ongoing' | 'completed' | 'canceled',
    ) {
        return this.adminService.updateTripStatus(id, status);
    }

    // Booking Management - Accessible by all admin roles
    @Get('bookings')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR)
    getAllBookings() {
        return this.adminService.getAllBookings();
    }

    @Get('bookings/:id')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR)
    getBookingById(@Param('id') id: string) {
        return this.adminService.getBookingById(id);
    }

    @Put('bookings/:id/status')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN) // Only Super Admin and Admin can change booking status
    updateBookingStatus(
        @Param('id') id: string,
        @Body('status') status: 'pending' | 'confirmed' | 'canceled',
    ) {
        return this.adminService.updateBookingStatus(id, status);
    }

    // Driver Management - Only Super Admin and Admin
    @Get('drivers')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    getAllDrivers() {
        return this.adminService.getAllDrivers();
    }

    @Get('drivers/:id')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    getDriverById(@Param('id') id: string) {
        return this.adminService.getDriverById(id);
    }

    @Put('drivers/:id/status')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    updateDriverStatus(
        @Param('id') id: string,
        @Body('status') status: 'active' | 'inactive' | 'blocked',
    ) {
        return this.adminService.updateDriverStatus(id, status);
    }
} 