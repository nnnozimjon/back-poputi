import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, EntityManager } from 'typeorm';
import { CarSeat } from './entities/car-seat.entity';
import { CreateCarSeatDto } from './dto/create-car-seat.dto';
import { Driver } from '../drivers/entities/driver.entity';
import { JwtService } from '@nestjs/jwt';

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
        manager?: EntityManager,
    ): Promise<CarSeat[]> {
        const carSeatRepo = manager
            ? manager.getRepository(CarSeat)
            : this.carSeatRepository;
        const driverRepo = manager
            ? manager.getRepository(Driver)
            : this.driverRepository;

        const { seats } = createCarSeatDto;

        // 1. Get driver ID by user_id (within transaction scope)
        const driver = await driverRepo.findOne({
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

        // 2. Create seat entities
        const carSeats = seats.map((seat) =>
            carSeatRepo.create({
                driver_id,
                seat_row: seat.seat_row,
                seat_column: seat.seat_column,
                is_driver_seat: seat.is_driver_seat,
            }),
        );

        try {
            // 3. Save to DB (within transaction)
            return await carSeatRepo.save(carSeats);
        } catch (error) {
            if (
                error instanceof QueryFailedError &&
                error.message.includes('UQ_DRIVER_SEAT_ROW_COLUMN')
            ) {
                throw new ConflictException(
                    'Место с такой строкой и колонкой уже существует для этого водителя.',
                );
            }
            throw error;
        }
    }

    async findAllDriverSeats(
        user_id: string,
        manager?: EntityManager,
    ): Promise<{ [key: number]: { id: number; is_driver: boolean }[] }> {
        const driverRepo = manager
            ? manager.getRepository(Driver)
            : this.driverRepository;

        const carSeatRepo = manager
            ? manager.getRepository(CarSeat)
            : this.carSeatRepository;

        // Fetch the driver_id using the user_id
        const driver = await driverRepo.findOne({
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
        const seats = await carSeatRepo.find({
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
            {} as { [key: number]: { id: number; is_driver: boolean }[] },
        );

        // Convert the grouped object to the desired format
        const result = Object.values(groupedSeats);

        return result;
    }
}
