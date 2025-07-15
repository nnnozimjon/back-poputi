import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Raw } from 'typeorm';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from '../trips/entities/trip.entity';
import { CarSeat } from '../car-seats/entities/car-seat.entity';
import { TripSeat } from '../trip-seats/entities/trip-seat.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { PaginationDto } from 'src/trip-seats/dto/pagination.dto';
import { Booking } from '../booking/entities/booking.entity';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
    constructor(
        @InjectRepository(Driver)
        private driverRepository: Repository<Driver>,
        @InjectRepository(Trip)
        private tripRepository: Repository<Trip>,
        @InjectRepository(TripSeat)
        private tripSeatRepository: Repository<TripSeat>,
        @InjectRepository(CarSeat)
        private carSeatRepository: Repository<CarSeat>,
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
        private dataSource: DataSource,
    ) { }

    async create(userId: string, createTripDto: CreateTripDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const driver = await this.driverRepository.findOne({
                where: { user_id: userId },
            });
            if (!driver) {
                throw new NotFoundException('Driver not found for this user');
            }

            this.validateTripTimes(createTripDto);

            const trip = this.tripRepository.create({
                driver_id: driver.id,
                departure_city: createTripDto.departure_city,
                destination_city: createTripDto.destination_city,
                departure_time: createTripDto.departure_time,
                destination_time: createTripDto.destination_time,
                is_sending_package_available:
                    createTripDto.is_sending_package_available ?? false,
                description: createTripDto.description ?? '',
            });

            const savedTrip = await queryRunner.manager.save(trip);

            const tripSeats = await this.createTripSeats(
                queryRunner,
                savedTrip.id,
                createTripDto.seats,
            );

            await queryRunner.commitTransaction();
            return { ...savedTrip, seats: tripSeats };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private validateTripTimes(createTripDto: CreateTripDto | UpdateTripDto) {
        if (
            new Date(createTripDto.destination_time) <=
            new Date(createTripDto.departure_time)
        ) {
            throw new BadRequestException(
                'Destination time must be after departure time',
            );
        }
    }

    private async createTripSeats(
        queryRunner: QueryRunner,
        tripId: string,
        seats: CreateTripDto['seats'],
    ) {
        return Promise.all(
            seats.map(async (seatDto) => {
                const carSeat = await queryRunner.manager.findOne(CarSeat, {
                    where: { id: seatDto.id },
                });

                if (!carSeat) {
                    throw new NotFoundException(
                        `CarSeat with ID ${seatDto.id} not found`,
                    );
                }

                const tripSeat = this.tripSeatRepository.create({
                    trip_id: tripId,
                    seat_id: seatDto.id,
                    price: seatDto.price ?? 0,
                    status: 'available',
                });

                return queryRunner.manager.save(tripSeat);
            }),
        );
    }

    async getAllTrips(paginationDto: PaginationDto) {
        const {
            page,
            limit,
            departure_city,
            destination_city,
            passengers,
            departure_time,
            type,
            price_sort,
            pickup_time_range,
        } = paginationDto;

        const query = this.tripRepository
            .createQueryBuilder('trip')
            .leftJoinAndSelect('trip.driver', 'driver')
            .leftJoinAndSelect('driver.user', 'user')
            .leftJoinAndSelect('driver.carBrand', 'carBrand')
            .leftJoinAndSelect('driver.carModel', 'carModel')
            .leftJoinAndSelect('driver.carSeats', 'carSeats')
            .leftJoinAndSelect('trip.tripSeats', 'tripSeats')
            .select([
                'trip.id',
                'trip.created_at',
                'trip.departure_city',
                'trip.departure_time',
                'trip.destination_city',
                'trip.destination_time',
                'driver.id',
                'carModel.name',
                'carBrand.name',
                'user.fullname',
                'user.id',
                'carSeats',
                'tripSeats',
            ]);

        if (departure_city) {
            query.andWhere('trip.departure_city = :departureCity', {
                departureCity: departure_city,
            });
        }

        if (destination_city) {
            query.andWhere('trip.destination_city = :destinationCity', {
                destinationCity: destination_city,
            });
        }

        if (departure_time) {
            const searchDate = departure_time.split('T')[0];

            query.andWhere('DATE(trip.departure_time) = :departureDate', {
                departureDate: searchDate,
            });
        }

        if (type) {
            query.andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('COUNT(cs.id)')
                    .from('car_seats', 'cs')
                    .where('cs.driver_id = driver.id')
                    .getQuery();

                return type === 'bus' ? `${subQuery} > 5` : `${subQuery} <= 5`;
            });
        }

        if (passengers) {
            query
                .andWhere((qb) => {
                    const subQuery = qb
                        .subQuery()
                        .select('COUNT(ts.id)')
                        .from('trip_seats', 'ts')
                        .where('ts.trip_id = trip.id')
                        .andWhere('ts.status = :status')
                        .getQuery();

                    return `${subQuery} >= :passengers`;
                })
                .setParameter('status', 'available')
                .setParameter('passengers', passengers);
        }

        if (pickup_time_range) {
            let startHour = 0, endHour = 24;
            switch (pickup_time_range) {
                case 'morning':
                    startHour = 6; endHour = 12; break;
                case 'afternoon':
                    startHour = 12; endHour = 18; break;
                case 'evening':
                    startHour = 18; endHour = 24; break;
                case 'night':
                    startHour = 0; endHour = 6; break;
            }
            query.andWhere(
                `EXTRACT(HOUR FROM trip.departure_time) >= :startHour AND EXTRACT(HOUR FROM trip.departure_time) < :endHour`,
                { startHour, endHour }
            );
        }

        query.andWhere('trip.departure_time > :currentTime', {
            currentTime: new Date(),
        });

        query.skip((page - 1) * limit).take(limit);

        const [trips, total] = await query.getManyAndCount();

        if (price_sort) {
            trips.sort((a, b) => {
                const availableSeatsA = a.tripSeats.filter(seat => seat.status === 'available');
                const availableSeatsB = b.tripSeats.filter(seat => seat.status === 'available');

                const minPriceA = availableSeatsA.length > 0
                    ? Math.min(...availableSeatsA.map(seat => Number(seat.price)))
                    : Infinity;
                const minPriceB = availableSeatsB.length > 0
                    ? Math.min(...availableSeatsB.map(seat => Number(seat.price)))
                    : Infinity;

                if (price_sort === 'lowest') {
                    return minPriceA - minPriceB; // ASC
                } else {
                    return minPriceB - minPriceA; // DESC
                }
            });
        } else {
            query.orderBy('trip.created_at', 'ASC');
        }

        // Structure the response
        const structuredTrips = trips.map((trip) => ({
            ...trip,
            driver: {
                user_fullname: trip.driver.user.fullname,
                car_model: trip.driver.carModel.name,
                car_brand: trip.driver.carBrand.name,
            },
        }));

        return {
            data: structuredTrips,
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async getTripById(id: string) {
        const trip = await this.tripRepository
            .createQueryBuilder('trip')
            .leftJoinAndSelect('trip.driver', 'driver')
            .leftJoinAndSelect('driver.user', 'user')
            .leftJoinAndSelect('driver.carBrand', 'carBrand')
            .leftJoinAndSelect('driver.carModel', 'carModel')
            .where('trip.id = :id', { id })
            .getOne();

        if (!trip) {
            throw new NotFoundException(`Trip with ID ${id} not found`);
        }

        // Get all car seats for this driver
        const carSeats = await this.carSeatRepository.find({
            where: { driver_id: trip.driver.id },
        });

        // Get all bookings for this trip
        const bookings = await this.bookingRepository.find({
            where: {
                trip_id: id,
                status: 'confirmed', // Only consider confirmed bookings
            },
            relations: ['seat'],
        });

        // Get all trip seats for this trip
        const tripSeats = await this.tripSeatRepository.find({
            where: { trip_id: id },
        });

        // Create a map of booked seat IDs from bookings
        const bookedSeatIds = new Set(
            bookings.map((booking) => booking.seat.seat_id),
        );

        // Create a map of booked seat IDs from trip seats with 'booked' status
        const bookedTripSeatIds = new Set(
            tripSeats
                .filter((tripSeat) => tripSeat.status === 'booked')
                .map((tripSeat) => tripSeat.seat_id),
        );

        // Create a map of available seat IDs from trip seats
        const availableSeatIds = new Set(
            tripSeats.map((tripSeat) => tripSeat.seat_id),
        );

        // Create a map of seat prices from trip seats
        const seatPrices = new Map(
            tripSeats.map((tripSeat) => [tripSeat.seat_id, tripSeat.price]),
        );

        // Process car seats to include booking status
        const processedCarSeats = carSeats.map((carSeat) => {
            const isBooked =
                carSeat.is_driver_seat ||
                bookedSeatIds.has(carSeat.id) ||
                bookedTripSeatIds.has(carSeat.id) ||
                !availableSeatIds.has(carSeat.id);
            return {
                id: carSeat.id,
                seat_row: carSeat.seat_row,
                seat_column: carSeat.seat_column,
                is_driver_seat: carSeat.is_driver_seat,
                is_booked: isBooked,
                price: seatPrices.get(carSeat.id) || 0, // Get price from trip seats, default to 0 if not set
            };
        });

        // Structure the response
        return {
            ...trip,
            driver: {
                user_fullname: trip.driver.user.fullname,
                car_model: trip.driver.carModel.name,
                car_brand: trip.driver.carBrand.name,
            },
            car_seats: processedCarSeats,
        };
    }

    async getMyTrips(userId: string) {
        const trips = await this.tripRepository
            .createQueryBuilder('trip')
            .leftJoinAndSelect('trip.driver', 'driver')
            .leftJoinAndSelect('driver.user', 'user')
            .leftJoinAndSelect('driver.carBrand', 'carBrand')
            .leftJoinAndSelect('driver.carModel', 'carModel')
            .where('user.id = :userId', { userId })
            .orderBy('trip.departure_time', 'ASC')
            .getMany();

        const tripsWithDetails = await Promise.all(
            trips.map(async (trip) => {
                // Get all car seats for this driver
                const carSeats = await this.carSeatRepository.find({
                    where: { driver_id: trip.driver.id },
                });

                // Get all bookings for this trip
                const bookings = await this.bookingRepository.find({
                    where: {
                        trip_id: trip.id,
                        // status: 'confirmed',
                    },
                    relations: ['seat'],
                });

                const tripSeats = await this.tripSeatRepository.find({
                    where: { trip_id: trip.id },
                });

                const bookedSeatIds = new Set(
                    bookings.map((booking) => booking.seat.seat_id),
                );
                const availableSeatIds = new Set(
                    tripSeats.map((seat) => seat.seat_id),
                );
                const seatPrices = new Map(
                    tripSeats.map((seat) => [seat.seat_id, seat.price]),
                );

                const processedCarSeats = carSeats.map((seat) => {
                    const isBooked =
                        seat.is_driver_seat ||
                        bookedSeatIds.has(seat.id) ||
                        !availableSeatIds.has(seat.id);
                    return {
                        id: seat.id,
                        seat_row: seat.seat_row,
                        seat_column: seat.seat_column,
                        is_driver_seat: seat.is_driver_seat,
                        is_booked: isBooked,
                        price: seatPrices.get(seat.id) || 0,
                    };
                });

                return {
                    ...trip,
                    driver: null,
                    car_seats: processedCarSeats,
                };
            }),
        );

        return {
            data: tripsWithDetails,
        };
    }

    async update(userId: string, tripId: string, updateTripDto: UpdateTripDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Validate driver exists
            const driver = await this.driverRepository.findOne({
                where: { user_id: userId },
            });

            if (!driver) {
                throw new NotFoundException('Driver not found for this user');
            }

            // 2. Find the trip and ensure it belongs to this driver
            const trip = await this.tripRepository.findOne({
                where: { id: tripId, driver_id: driver.id },
            });

            if (!trip) {
                throw new NotFoundException('Trip not found or access denied');
            }

            // 3. Validate times
            if (
                updateTripDto.departure_time &&
                updateTripDto.destination_time
            ) {
                this.validateTripTimes(updateTripDto);
            }

            // 4. Update trip fields
            Object.assign(trip, {
                departure_city:
                    updateTripDto.departure_city ?? trip.departure_city,
                destination_city:
                    updateTripDto.destination_city ?? trip.destination_city,
                departure_time:
                    updateTripDto.departure_time ?? trip.departure_time,
                destination_time:
                    updateTripDto.destination_time ?? trip.destination_time,
                is_sending_package_available:
                    updateTripDto.is_sending_package_available ??
                    trip.is_sending_package_available,
                description: updateTripDto.description ?? trip.description,
            });

            const updatedTrip = await queryRunner.manager.save(trip);

            // 5. If seats need to be updated, replace them
            let updatedSeats = [];
            if (updateTripDto.seats) {
                // Optional: delete old seats and re-create
                await this.tripSeatRepository.delete({ trip_id: trip.id });

                updatedSeats = await this.createTripSeats(
                    queryRunner,
                    trip.id,
                    updateTripDto.seats,
                );
            }

            await queryRunner.commitTransaction();
            return { ...updatedTrip, seats: updatedSeats };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // async delete(userId: string, tripId: string) {
    //     const driver = await this.driverRepository.findOne({
    //         where: { user_id: userId },
    //     });

    //     if (!driver) {
    //         throw new NotFoundException('Driver not found for this user');
    //     }

    //     const trip = await this.tripRepository.findOne({
    //         where: {
    //             id: tripId,
    //             driver_id: driver.id,
    //         },
    //     });

    //     if (!trip) {
    //         throw new NotFoundException('Trip not found or access denied');
    //     }

    //     await this.tripSeatRepository.delete({ trip_id: tripId });
    //     await this.bookingRepository.delete({ trip_id: tripId });

    //     // 4. Delete the trip
    //     await this.tripRepository.delete(tripId);

    //     return { message: 'Trip successfully deleted' };
    // }
}
