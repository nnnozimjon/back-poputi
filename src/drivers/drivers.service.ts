import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { User } from 'src/users/entities/user.entity';
import { DriverDetailsDto } from './dto/driver-details.dto';
import { JwtService } from '@nestjs/jwt';

// !comment: change validation to russian language

@Injectable()
export class DriversService {
    constructor(
        @InjectRepository(Driver) private driverRepository: Repository<Driver>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async create(createDriverDto: CreateDriverDto): Promise<{ driver: Driver, token: string }> {
        const existingDriver = await this.driverRepository.findOne({
            where: { user_id: createDriverDto.user_id },
        });

        const existingCarPlateNumber = await this.driverRepository.findOne({
            where: { plate_number: createDriverDto.plate_number },
        });

        if (existingDriver) {
            throw new ConflictException({
                message: `На вас уже зарегистрирован автомобиль!`,
                code: 409,
            });
        }

        if (existingCarPlateNumber) {
            throw new ConflictException({
                message: `Автомобиль с номерным знаком ${createDriverDto.plate_number} зарегистрирован на вашего пользователя!`,
                code: 409,
            });
        }

        // Create and save the new driver
        const driver = this.driverRepository.create(createDriverDto);
        const savedDriver = await this.driverRepository.save(driver);

        // Update the user's is_driver field to true
        await this.userRepository.update(
            { id: createDriverDto.user_id },
            { is_driver: true },
        );

        // Get the user to generate new token
        const user = await this.userRepository.findOne({
            where: { id: createDriverDto.user_id },
            relations: ['drivers']
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Generate new token with updated is_driver status
        const payload = {
            id: user.id,
            email: user.email,
            phone_number: user.phone_number,
            roles: user.roles,
            is_driver: true,
            is_car_seats_added: user.drivers[0]?.carSeats?.length > 0 ? true : false
        };

        const token = this.jwtService.sign(payload);

        return { driver: savedDriver, token };
    }

    async userVehicleDetails(user_id: string): Promise<DriverDetailsDto> {
        const driver = await this.driverRepository.findOne({
            where: { user_id },
            relations: ['carColor', 'carBodyType', 'carBrand', 'carModel'],
        });

        if (!driver) {
            throw new NotFoundException({
                code: 404,
                message: `У вас нет зарегистрированного автомобиля!`,
            });
        }

        const driverDetails: DriverDetailsDto = {
            user_id: driver.user_id,
            plate_number: driver.plate_number,
            car_color: driver.carColor ? driver.carColor.name : null,
            car_body_type: driver.carBodyType ? driver.carBodyType.name : null,
            car_brand: driver.carBrand ? driver.carBrand.name : null,
            car_model: driver.carModel ? driver.carModel.name : null,
        };

        return driverDetails;
    }

    // Retrieve all drivers
    async findAll(): Promise<Driver[]> {
        return this.driverRepository.find();
    }

    // Retrieve a single driver by ID
    async findOne(id: string): Promise<Driver> {
        return this.driverRepository.findOne({ where: { id } });
    }

    // Update a driver by ID
    async update(
        id: string,
        updateDriverDto: UpdateDriverDto,
    ): Promise<Driver> {
        await this.driverRepository.update(id, updateDriverDto);
        return this.driverRepository.findOne({ where: { id } });
    }

    // Delete a driver by ID
    async remove(id: string): Promise<void> {
        await this.driverRepository.delete(id);
    }
}
