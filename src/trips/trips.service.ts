import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from '../trips/entities/trip.entity';
import { CarSeat } from '../car-seats/entities/car-seat.entity';
import { TripSeat } from '../trip-seats/entities/trip-seat.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { PaginationDto } from 'src/trip-seats/dto/pagination.dto';

// !comment: change validations to russian
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
        private dataSource: DataSource,
    ) {}

    async create(userId: string, createTripDto: CreateTripDto) {
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

            // 2. Validate trip times
            this.validateTripTimes(createTripDto);

            // 3. Create the Trip
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

            // 4. Create and validate TripSeat records
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

    private validateTripTimes(createTripDto: CreateTripDto) {
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
        const { page, limit } = paginationDto;

        const query = this.tripRepository
            .createQueryBuilder('trip')
            .leftJoinAndSelect('trip.driver', 'driver')
            .leftJoinAndSelect('driver.user', 'user')
            .leftJoinAndSelect('driver.carBrand', 'carBrand')
            .leftJoinAndSelect('driver.carModel', 'carModel')
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
            ]);

        // Add filters if they exist
        if (paginationDto?.departure_city) {
            query.andWhere('trip.departure_city = :departureCity', {
                departureCity: paginationDto.departure_city,
            });
        }

        if (paginationDto?.destination_city) {
            query.andWhere('trip.destination_city = :destinationCity', {
                destinationCity: paginationDto.destination_city,
            });
        }

        // Add pagination and ordering
        query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('trip.created_at', 'ASC');

        const [trips, total] = await query.getManyAndCount();

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
      
    }
}
