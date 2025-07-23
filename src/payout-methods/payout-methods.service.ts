import {
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutMethod } from './entities/payout-method.entity';

@Injectable()
export class PayoutMethodsService {
    constructor(
        @InjectRepository(PayoutMethod)
        private payoutMethodRepo: Repository<PayoutMethod>,
    ) { }

    async getPayoutMethods() {
        const payouts = await this.payoutMethodRepo.find();

        return payouts?.map(payout => {
            return {
                value: payout.id,
                label: payout.name,
            }
        })
    }
}
