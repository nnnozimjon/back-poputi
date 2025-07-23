import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { UserPayoutsService } from './user-payouts.service';
import { CreateUserPayoutDto } from './dto/user-payouts.dto';

@Controller('user-payouts')
export class UserPayoutsController {
  constructor(private readonly userPayoutsService: UserPayoutsService) {}

  @Get('get-user-payouts')
  getUserPayouts(@Req() req: Request) {
    const { id: user_id } = req["user"]
    return this.userPayoutsService.getUserPayouts(user_id);
  }

  @Post('create')
  createUserPayout(@Req() req: Request, @Body() dto: CreateUserPayoutDto) {
    const { id: user_id } = req["user"]
    return this.userPayoutsService.createUserPayout({...dto, user_id, phone_number: dto.phone_number});
  }
}
