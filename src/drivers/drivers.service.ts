import {
    ConflictException,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { User } from 'src/users/entities/user.entity';
import { DriverDetailsDto } from './dto/driver-details.dto';
import { JwtService } from '@nestjs/jwt';
import { ImageService } from 'src/images/image.service';


// !comment: change validation to russian language

@Injectable()
export class DriversService {
    constructor(
        @InjectRepository(Driver) private driverRepository: Repository<Driver>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly imageService: ImageService,
    ) {}

    async create(
        createDriverDto: CreateDriverDto,
        manager?: EntityManager,
    ): Promise<Driver> {
        const repo = manager
            ? manager.getRepository(Driver)
            : this.driverRepository;
        const userRepo = manager
            ? manager.getRepository(User)
            : this.userRepository;

        const existingDriver = await repo.findOne({
            where: { user_id: createDriverDto.user_id },
        });

        const existingCarPlateNumber = await repo.findOne({
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
                message: `Автомобиль с номерным знаком ${createDriverDto.plate_number} зарегистрирован на другого пользователя!`,
                code: 409,
            });
        }

        // Create and save driver
        const driver = repo.create(createDriverDto);
        const savedDriver = await repo.save(driver);

        // Update user is_driver to true
        await userRepo.update(
            { id: createDriverDto.user_id },
            { is_driver: true },
        );

        return savedDriver;
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
            car_color: driver.carColor ? driver.carColor : null,
            car_body_type: driver.carBodyType ? driver.carBodyType : null,
            car_brand: driver.carBrand ? driver.carBrand : null,
            car_model: driver.carModel ? driver.carModel : null,
        };

        return driverDetails;
    }

    async update(
        userId: string,
        updateDriverDto: UpdateDriverDto,
    ): Promise<{ driver: Driver; token: string }> {
        // 1. Find existing driver record
        const existingDriver = await this.driverRepository.findOne({
            where: { user_id: userId },
            relations: ['carSeats'],
        });

        if (!existingDriver) {
            throw new NotFoundException({
                message: 'Driver record not found',
                code: 404,
            });
        }

        // 2. Check for duplicate plate number (excluding current driver)
        if (
            updateDriverDto.plate_number &&
            updateDriverDto.plate_number !== existingDriver.plate_number
        ) {
            const existingPlate = await this.driverRepository.findOne({
                where: { plate_number: updateDriverDto.plate_number },
            });

            if (existingPlate) {
                throw new ConflictException({
                    message: `Автомобиль с номерным знаком ${updateDriverDto.plate_number} уже зарегистрирован!`,
                    code: 409,
                });
            }
        }

        // 3. Update driver record
        const updatedDriver = await this.driverRepository.save({
            ...existingDriver,
            ...updateDriverDto,
        });

        // 4. Get updated user with relations
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['drivers'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 5. Generate new token with updated driver info
        const payload = {
            id: user.id,
            phone_number: user.phone_number,
            fullname: user.fullname,
            roles: user.roles,
            is_driver: true,
            is_car_seats_added: user.drivers[0]?.carSeats?.length > 0,
        };

        const token = this.jwtService.sign(payload);

        return {
            driver: updatedDriver,
            token,
        };
    }

    async uploadCarImages(userId: string, files: Express.Multer.File[]) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user is a driver
        if (!user.is_driver) {
            throw new BadRequestException('Only drivers can upload car images');
        }

        // Initialize car_images array if it doesn't exist
        if (!user.car_images) {
            user.car_images = [];
        }

        // Check if adding these images would exceed the limit of 5
        if (user.car_images.length + files.length > 5) {
            throw new BadRequestException('Maximum 5 car images allowed. You currently have ' + user.car_images.length + ' images.');
        }

        const savedImageNames: string[] = [];

        try {
            for (const file of files) {
                const image = await this.imageService.saveImage(file);
                savedImageNames.push(image.fileName);
            }

            // Add all new image names to the user's car_images array
            user.car_images = [...user.car_images, ...savedImageNames];

            const updatedUser = await this.userRepository.save(user);
            
            // Return the updated user with full image URLs
            return {
                ...updatedUser,
                car_images: updatedUser.car_images.map(imageName => 
                    `${process.env.API_URL || 'http://localhost:3000'}/images/${imageName}`
                )
            };
        } catch (error) {
            // If there's an error, try to clean up any saved images
            for (const imageName of savedImageNames) {
                try {
                    await this.imageService.deleteImage(imageName);
                } catch (deleteError) {
                    console.error('Failed to delete image during rollback:', deleteError);
                }
            }
            throw error;
        }
    }

    async getCarImages(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user is a driver
        if (!user.is_driver) {
            throw new BadRequestException('Only drivers can access car images');
        }

        return {
            car_images: user.car_images ? user.car_images.map(imageName => 
                `${process.env.API_URL || 'http://localhost:3000'}/images/${imageName}`
            ) : []
        };
    }

    async deleteCarImage(userId: string, imageName: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user is a driver
        if (!user.is_driver) {
            throw new BadRequestException('Only drivers can delete car images');
        }

        if (!user.car_images || !user.car_images.includes(imageName)) {
            throw new NotFoundException('Image not found in user\'s car images');
        }

        try {
            // Remove the image from the user's car_images array
            user.car_images = user.car_images.filter(img => img !== imageName);
            await this.userRepository.save(user);

            // Delete the actual image file
            await this.imageService.deleteImage(imageName);

            return {
                message: 'Car image deleted successfully',
                remaining_images: user.car_images.length
            };
        } catch (error) {
            throw new BadRequestException('Failed to delete car image');
        }
    }

    // Retrieve all drivers
    async findAll(): Promise<Driver[]> {
        return this.driverRepository.find();
    }

    // Retrieve a single driver by ID
    async findOne(id: string): Promise<Driver> {
        return this.driverRepository.findOne({ where: { id } });
    }

    // Delete a driver by ID
    async remove(id: string): Promise<void> {
        await this.driverRepository.delete(id);
    }
}
