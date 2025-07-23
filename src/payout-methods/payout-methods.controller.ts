import { Controller, Get } from '@nestjs/common';
import { PayoutMethodsService } from './payout-methods.service';

@Controller('payout-methods')
export class PayoutMethodsController {
  constructor(private readonly payoutMethodsService: PayoutMethodsService) {}

  @Get('get-payout-methods')
  getPayoutMethods() {
    return this.payoutMethodsService.getPayoutMethods();
  }
}
