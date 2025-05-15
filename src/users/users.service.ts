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
import {
    LoginUserDto,
    RegisterUserDto,
    SendOtpCodeDto,
} from './dto/create-user.dto';
import { SmsService } from 'src/sms/sms.service';
import { DriversService } from 'src/drivers/drivers.service';
import { CarSeatsService } from 'src/car-seats/car-seats.service';
import { ImageService } from 'src/images/image.service';

@Injectable()
export class UsersService {
    private otpStore = new Map<string, { otp: string; createdAt: number }>(); // Temporary OTP storage

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectDataSource() private readonly dataSource: DataSource,

        private jwtService: JwtService,
        private readonly smsService: SmsService,
        private readonly imageService: ImageService,
        private readonly carDetailsService: DriversService,
        private readonly carSeatsService: CarSeatsService,
    ) {}

    async sendOtpCode(phone_number: string) {
        const otp = this.generateOtp();

        this.otpStore.set(phone_number, {
            otp,
            createdAt: Date.now(),
        });

        await this.smsService.sendSms(
            phone_number,
            `Ваш код подтверждения: ${otp}`,
        );

        return { message: 'OTP успешно отправлен!' };
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async verifyOtpCode(
        phone_number: string,
        otp_code: string,
    ): Promise<boolean> {
        const otpRecord = this.otpStore.get(phone_number);

        if (!otpRecord) {
            return false;
        }

        if (otpRecord.otp !== otp_code) {
            return false;
        }

        const otpExpiryTime = otpRecord.createdAt + 10 * 60 * 1000;
        const currentTime = Date.now();

        if (currentTime > otpExpiryTime) {
            this.otpStore.delete(phone_number);
            return false;
        }

        this.otpStore.delete(phone_number);
        return true;
    }

    async checkUserExists(phone_number: string) {
        const user = await this.userRepository.findOne({
            where: { phone_number },
        });

        if (user) {
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
            const user = await this.createUser({ ...dto }, queryRunner.manager);

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

            const isOtpValid = await this.verifyOtpCode(
                dto.phone_number,
                dto.otp_code,
            );

            if (!isOtpValid) {
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
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private parseJsonField(field: any, fieldName: string) {
        try {
            return typeof field === 'string' ? JSON.parse(field) : field;
        } catch {
            throw new BadRequestException(
                `Ошибка при обработке поля ${fieldName}`,
            );
        }
    }

    async createUser(dto: RegisterUserDto, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(User)
            : this.userRepository;
        const user = repo.create({
            email: dto.phone_number.includes('@') ? dto.phone_number : null,
            phone_number: dto.phone_number.includes('@')
                ? null
                : dto.phone_number,
            fullname: dto.username,
            avatar_image: dto.avatar_image,
            is_driver: true,
            status: 'active',
            roles: [],
        });
        return repo.save(user);
    }

    async loginUser(dto: LoginUserDto) {
        const isOtpValid = await this.verifyOtpCode(
            dto.phone_number,
            dto.otp_code,
        );

        if (!isOtpValid) {
            throw new UnauthorizedException('Неверный код подтверждения');
        }

        const user = await this.userRepository.findOne({
            where: { phone_number: dto.phone_number },
        });

        if (!user) {
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
        const token = await this.jwtService.signAsync(payload);

        return {
            token,
            user,
        };
    }
}
