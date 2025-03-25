import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { CarSeat } from './entities/car-seat.entity';
import { CreateCarSeatDto } from './dto/create-car-seat.dto';
import { Driver } from '../drivers/entities/driver.entity';

@Injectable()
export class CarSeatsService {
    constructor(
        @InjectRepository(CarSeat)
        private readonly carSeatRepository: Repository<CarSeat>,
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>,
    ) {}

    async create(
        user_id: string,
        createCarSeatDto: CreateCarSeatDto,
    ): Promise<CarSeat[]> {
        const { seats } = createCarSeatDto;

        // Fetch the driver_id using the user_id
        const driver = await this.driverRepository.findOne({
            where: { user_id },
            select: ['id'],
        });

        if (!driver) {
            throw new NotFoundException({
                code: 400,
                message: `У вас нет зарегистрированного автомобиля!`,
            });
        }

        const driver_id = driver.id;

        // Create an array of CarSeat entities
        const carSeats = seats.map((seat) =>
            this.carSeatRepository.create({
                driver_id,
                seat_row: seat.seat_row,
                seat_column: seat.seat_column,
                is_driver_seat: seat.is_driver_seat,
            }),
        );

        try {
            // Save all car seats to the database
            return await this.carSeatRepository.save(carSeats);
        } catch (error) {
            if (
                error instanceof QueryFailedError &&
                error.message.includes('UQ_DRIVER_SEAT_ROW_COLUMN')
            ) {
                throw new ConflictException(
                    'A seat with the same row and column already exists for this driver.',
                );
            }
            throw error; // Re-throw other errors
        }
    }

    async findAllDriverSeats(
        user_id: string,
    ): Promise<{ [key: number]: { id: number, is_driver: boolean }[] }> {
        // Fetch the driver_id using the user_id
        const driver = await this.driverRepository.findOne({
            where: { user_id },
            select: ['id'],
        });

        if (!driver) {
            throw new NotFoundException({
                code: 400,
                message: `У вас нет зарегистрированного автомобиля!`,
            });
        }

        const driver_id = driver.id;

        // Fetch all seats for the driver
        const seats = await this.carSeatRepository.find({
            where: { driver_id },
            order: { seat_row: 'ASC', seat_column: 'ASC' }, // Order by row and column
        });

        // Group seats by seat_row
        const groupedSeats = seats.reduce(
            (acc, seat) => {
                const row = seat.seat_row;
                if (!acc[row]) {
                    acc[row] = [];
                }
                acc[row].push({ id: seat.id, is_driver: seat.is_driver_seat });
                return acc;
            },
            {} as { [key: number]: { id: number, is_driver: boolean }[] },
        );

        // Convert the grouped object to the desired format
        const result = Object.values(groupedSeats);

        return result;
    }
}
