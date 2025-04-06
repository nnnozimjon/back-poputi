import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UsersService {
    @Inject(EmailService)
    private readonly emailService: EmailService;

    private otpStore = new Map<string, string>(); // Temporary OTP storage

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    // Step 1: Generate OTP and store it
    async create(createUserDto: CreateUserDto) {
        const { email, phone_number } = createUserDto;

        if (!email && !phone_number) {
            throw new UnauthorizedException(
                'Email or phone number is required',
            );
        }

        const contact = email || phone_number; // Identify the contact method
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

        if (email) {
            this.emailService.sendOtpEmail(email, otp);
        }
        this.otpStore.set(contact, otp); // Store OTP temporarily

        return { message: 'OTP sent successfully' };
    }

    // Step 2: Verify OTP and store the user
    async verifyOtp(login: string, otp: string, fullname: string) {
        const storedOtp = this.otpStore.get(login);

        if (!storedOtp || storedOtp !== otp) {
            throw new UnauthorizedException('Invalid OTP');
        }

        this.otpStore.delete(login); // Remove OTP after successful verification

        // Check if user already exists (searching for email or phone_number)
        let user = await this.userRepository.findOne({
            where: [{ email: login }, { phone_number: login }],
            relations: ['drivers', 'drivers.carSeats'] // Include drivers and their car seats
        });

        if (!user) {
            // Create new user
            user = this.userRepository.create({
                email: login.includes('@') ? login : null,
                phone_number: login.includes('@') ? null : login,
                fullname, // Default empty, should be updated later
                profile_picture: null,
                is_driver: false,
                status: 'active',
                roles: [], // Empty by default
            });

            await this.userRepository.save(user);
        }

        // Check if user has car seats
        const is_car_seats_added = user.drivers?.some(driver => 
            driver.carSeats && driver.carSeats.length > 0
        );

        // Generate JWT Token
        const payload = {
            id: user.id,
            email: user.email,
            phone_number: user.phone_number,
            roles: user.roles,
            is_driver: user.is_driver,
            is_car_seats_added: is_car_seats_added || false
        };
        const token = this.jwtService.sign(payload);

        return { message: 'Login successful', token, user };
    }
}
