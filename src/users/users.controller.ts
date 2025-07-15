import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Get,
    Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterPassengerDto, RegisterUserDto, SendOtpCodeDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OtpService } from 'src/otp/otp.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly otpService: OtpService,
    ) {}

    @Post('send-otp')
    async sendOtp(@Body() createUserDto: SendOtpCodeDto) {
        return this.otpService.sendOtp(
            createUserDto.phone_number,
            createUserDto.type,
        );
    }

    @Post('check-user')
    async checkUser(@Body() body: { phone_number: string }) {
        return this.usersService.checkUserExists(body.phone_number);
    }

    @Post('register')
    @UseInterceptors(FileInterceptor('avatar_image'))
    async registerUser(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {
        const parsedDto: RegisterUserDto = {
            ...body,
            car_details: JSON.parse(body.car_details),
            car_seats: JSON.parse(body.car_seats),
            avatar_image: file,
        };

        const errors = await validate(
            plainToInstance(RegisterUserDto, parsedDto),
        );
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        return this.usersService.registerUser(body);
    }

    @Post('register-passenger')
    async registerPassenger(@Body() body: RegisterPassengerDto) {
        return this.usersService.createPassengerUser(body);
    }

    @Post('login')
    async login(@Body() body: { phone_number: string; password: string }) {
        return this.usersService.loginUser(body);
    }

    @Post('verify-otp')
    verifyOtp(
        @Body() body: { phone_number: string; otp: string; type: string },
    ) {
        return this.otpService.verifyOtp(
            body.phone_number,
            body.type,
            body.otp,
        );
    }

    @Get('get-user-info')
    async getUserInfo(@Req() req: Request) {
        const { id: user_id } = req["user"]
        return this.usersService.getUserInfo(user_id);
    }
}
