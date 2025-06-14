import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto, RegisterPassengerDto, RegisterUserDto } from './dto/create-user.dto';
import { DriversService } from 'src/drivers/drivers.service';
import { CarSeatsService } from 'src/car-seats/car-seats.service';
import { ImageService } from 'src/images/image.service';
import { OtpService } from 'src/otp/otp.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectDataSource() private readonly dataSource: DataSource,

        private jwtService: JwtService,
        private readonly imageService: ImageService,
        private readonly otpService: OtpService,
        private readonly carDetailsService: DriversService,
        private readonly carSeatsService: CarSeatsService,
    ) {}

    async checkUserExists(phone_number: string) {
        const cleanedPhoneNumber = phone_number
            .replace(/\D/g, '')
            .replace(/^992/, '');
        const user = await this.userRepository.findOne({
            where: { phone_number: cleanedPhoneNumber },
        });

        if (user) {
            console.log('Error: User already exists with phone number:', cleanedPhoneNumber);
            throw new ConflictException(
                'Пользователь с таким номером телефона уже существует.',
            );
        }

        return;
    }

    async registerUser(dto: RegisterUserDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await this.createDriverUser(
                { ...dto },
                queryRunner.manager,
            );

            const carDetails = this.parseJsonField(
                dto.car_details,
                'car_details',
            );

            await this.carDetailsService.create(
                { ...carDetails, user_id: user.id },
                queryRunner.manager,
            );

            const carSeats = this.parseJsonField(dto.car_seats, 'car_seats');

            await this.carSeatsService.create(
                user.id,
                { seats: carSeats },
                queryRunner.manager,
            );

            const isOtpValid = await this.otpService.verifyOtp(
                dto.phone_number,
                'register',
                dto.otp_code,
            );

            if (!isOtpValid) {
                console.log('Error: Invalid OTP code for registration');
                throw new UnauthorizedException('Неверный код подтверждения');
            }

            if (dto.avatar_image) {
                const image = await this.imageService.saveImage(
                    dto.avatar_image,
                );

                await queryRunner.manager.update('users', user.id, {
                    avatar_image: image.fileName,
                });
            }
            await queryRunner.commitTransaction();
            return { success: true, userId: user.id };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.log('Error in registerUser:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private parseJsonField(field: any, fieldName: string) {
        try {
            return typeof field === 'string' ? JSON.parse(field) : field;
        } catch {
            console.log('Error: Failed to parse JSON field:', fieldName);
            throw new BadRequestException(
                `Ошибка при обработке поля ${fieldName}`,
            );
        }
    }

    async createDriverUser(dto: RegisterUserDto, manager?: EntityManager) {
        const cleanedPhoneNumber = dto.phone_number
            .replace(/\D/g, '')
            .replace(/^992/, '');
        const repo = manager
            ? manager.getRepository(User)
            : this.userRepository;
        const user = repo.create({
            phone_number: cleanedPhoneNumber,
            street_address: dto.street_address,
            fullname: dto.username,
            avatar_image: dto.avatar_image,
            is_driver: true,
            status: 'active',
            roles: ['driver'],
        });
        return repo.save(user);
    }

    async createPassengerUser(dto: RegisterPassengerDto) {
        const cleanedPhoneNumber = dto.phone_number
            .replace(/\D/g, '')
            .replace(/^992/, '');
        const user = this.userRepository.create({
            phone_number: cleanedPhoneNumber,
            fullname: dto.username,
            is_driver: false,
            status: 'active',
            roles: ['passenger'],
        });
        return this.userRepository.save(user);
    }

    async loginUser(dto: LoginUserDto) {
        const cleanedPhoneNumber = dto.phone_number
            .replace(/\D/g, '')
            .replace(/^992/, '');
        const isOtpValid = await this.otpService.verifyOtp(
            dto.phone_number,
            'login',
            dto.otp_code,
        );

        if (!isOtpValid) {
            console.log('Error: Invalid OTP code for login');
            throw new UnauthorizedException('Неверный код подтверждения');
        }

        const user = await this.userRepository.findOne({
            where: { phone_number: cleanedPhoneNumber },
        });

        if (!user) {
            console.log('Error: User not found with phone number:', cleanedPhoneNumber);
            throw new UnauthorizedException('Пользователь не найден');
        }

        const payload = {
            id: user.id,
            phone_number: user.phone_number,
            fullname: user.fullname,
            avatar_image: user.avatar_image,
            street_address: user.street_address,
            is_driver: user.is_driver,
        };

        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '365d',
        });

        return {
            token,
            user,
        };
    }
}
