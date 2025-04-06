import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { TripSeat } from 'src/trip-seats/entities/trip-seat.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
        @InjectRepository(TripSeat)
        private tripSeatRepository: Repository<TripSeat>,
        private dataSource: DataSource,
    ) {}

    async create(createBookingDto: CreateBookingDto, userId: string) {
        const { trip_id, seat_ids } = createBookingDto;

        // Start a transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // First, get all trip seats for these seat_ids
            const tripSeats = await this.tripSeatRepository.find({
                where: { 
                    trip_id,
                    seat_id: In(seat_ids)
                }
            });

            if (tripSeats.length !== seat_ids.length) {
                throw new NotFoundException('One or more seats not found for this trip');
            }

            // Get the trip seat IDs
            const tripSeatIds = tripSeats.map(ts => ts.id);

            // Check if any of the trip seats are already booked by anyone
            const existingBookings = await this.bookingRepository.find({
                where: { 
                    trip_id,
                    seat_id: In(tripSeatIds.map(id => id.toString())),
                    status: 'confirmed'
                }
            });

            if (existingBookings.length > 0) {
                throw new BadRequestException('One or more seats are already booked');
            }

            // Check if the client has already booked any of these trip seats for this trip
            const clientExistingBookings = await this.bookingRepository.find({
                where: { 
                    trip_id,
                    client_id: userId,
                    seat_id: In(tripSeatIds.map(id => id.toString())),
                    status: In(['pending', 'confirmed'])
                }
            });

            if (clientExistingBookings.length > 0) {
                throw new BadRequestException('You have already booked one or more of these seats for this trip');
            }

            // Create bookings for all trip seats
            const bookings = tripSeats.map(tripSeat => 
                this.bookingRepository.create({
                    trip_id,
                    client_id: userId,
                    seat_id: tripSeat.id.toString(),
                    status: 'confirmed'
                })
            );

            // Save all bookings
            const savedBookings = await queryRunner.manager.save(bookings);

            await queryRunner.commitTransaction();
            return savedBookings;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll() {
        return this.bookingRepository.find({
            relations: ['trip', 'client', 'seat']
        });
    }

    async findOne(id: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['trip', 'client', 'seat']
        });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }

        return booking;
    }

    async update(id: string, updateBookingDto: UpdateBookingDto) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['seat']
        });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }

        // If updating status to canceled, make the seat available again
        if (updateBookingDto.status === 'canceled') {
            await this.tripSeatRepository.update(
                { id: booking.seat.id },
                { status: 'available' }
            );
        }

        // Update the booking
        await this.bookingRepository.update(id, updateBookingDto);
        return this.bookingRepository.findOne({
            where: { id },
            relations: ['trip', 'client', 'seat']
        });
    }

    async remove(id: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['seat']
        });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }

        // Make the seat available again
        await this.tripSeatRepository.update(
            { id: booking.seat.id },
            { status: 'available' }
        );

        // Delete the booking
        await this.bookingRepository.delete(id);
        return { message: 'Booking deleted successfully' };
    }
}
