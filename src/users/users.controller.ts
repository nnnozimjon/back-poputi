import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto, SendOtpCodeDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('send-otp')
    async sendOtp(@Body() createUserDto: SendOtpCodeDto) {
        return this.usersService.sendOtpCode(createUserDto.phone_number);
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

    @Post('login')
    async login(@Body() body: { phone_number: string; otp_code: string }) {
        return this.usersService.loginUser(body);
    }

    @Post('verify-otp')
    verifyOtp(@Body() body: { phone_number: string; otp: string }) {
        return this.usersService.verifyOtpCode(body.phone_number, body.otp);
    }
}
