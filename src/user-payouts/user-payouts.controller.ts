import { Controller, Post, Body, Req } from '@nestjs/common';
import { UserPayoutsService } from './user-payouts.service';
import { CreateUserPayoutDto } from './dto/user-payouts.dto';

@Controller('user-payouts')
export class UserPayoutsController {
  constructor(private readonly userPayoutsService: UserPayoutsService) {}

  @Post('create')
  createUserPayout(@Req() req: Request, @Body() dto: CreateUserPayoutDto) {
    const { id: user_id } = req["user"]
    return this.userPayoutsService.createUserPayout({...dto, user_id, phone_number: dto.phone_number});
  }
}
