import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('send-otp')
  sendOtp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { login: string; otp: string, fullname: string }) {
    return this.usersService.verifyOtp(body.login, body.otp, body.fullname);
  }
}
