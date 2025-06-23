import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { CarSeat } from '../car-seats/entities/car-seat.entity';
import { Role } from '../auth/enums/roles.enum';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Trip)
        private tripRepository: Repository<Trip>,
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
        @InjectRepository(Driver)
        private driverRepository: Repository<Driver>,
        @InjectRepository(CarSeat)
        private carSeatRepository: Repository<CarSeat>,
    ) {}

    // User Management
    async getAllUsers() {
        return this.userRepository.find({
            relations: ['drivers', 'bookings'],
        });
    }

    async getUserById(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['drivers', 'bookings'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateUserStatus(id: string, status: 'active' | 'inactive' | 'blocked') {
        const user = await this.getUserById(id);
        user.status = status;
        return this.userRepository.save(user);
    }

    async updateUserRole(id: string, roles: Role[]) {
        const user = await this.getUserById(id);
        user.roles = roles;
        return this.userRepository.save(user);
    }

    // Trip Management
    async getAllTrips() {
        return this.tripRepository.find({
            relations: ['driver', 'driver.user', 'tripSeats', 'bookings'],
        });
    }

    async getTripById(id: string) {
        const trip = await this.tripRepository.findOne({
            where: { id },
            relations: ['driver', 'driver.user', 'tripSeats', 'bookings'],
        });

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        return trip;
    }

    async updateTripStatus(id: string, status: 'scheduled' | 'ongoing' | 'completed' | 'canceled') {
        const trip = await this.getTripById(id);
        trip.status = status;
        return this.tripRepository.save(trip);
    }

    // Booking Management
    async getAllBookings() {
        return this.bookingRepository.find({
            relations: ['trip', 'client', 'seat'],
        });
    }

    async getBookingById(id: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['trip', 'client', 'seat'],
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    async updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'canceled') {
        const booking = await this.getBookingById(id);
        booking.status = status;
        return this.bookingRepository.save(booking);
    }

    // Driver Management
    async getAllDrivers() {
        return this.driverRepository.find({
            relations: ['user', 'carBrand', 'carModel', 'carSeats', 'trips'],
        });
    }

    async getDriverById(id: string) {
        const driver = await this.driverRepository.findOne({
            where: { id },
            relations: ['user', 'carBrand', 'carModel', 'carSeats', 'trips'],
        });

        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        return driver;
    }

    async updateDriverStatus(id: string, status: 'active' | 'inactive' | 'blocked') {
        const driver = await this.getDriverById(id);
        driver.user.status = status;
        return this.driverRepository.save(driver);
    }

    // Statistics
    async getDashboardStats() {
        const [
            totalUsers,
            totalDrivers,
            totalTrips,
            totalBookings,
            activeTrips,
            pendingBookings,
        ] = await Promise.all([
            this.userRepository.count(),
            this.driverRepository.count(),
            this.tripRepository.count(),
            this.bookingRepository.count(),
            this.tripRepository.count({ where: { status: 'scheduled' } }),
            this.bookingRepository.count({ where: { status: 'pending' } }),
        ]);

        return {
            totalUsers,
            totalDrivers,
            totalTrips,
            totalBookings,
            activeTrips,
            pendingBookings,
        };
    }
} 