import {
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPayout } from './entities/user-payouts.entity';
import { CreateUserPayoutDto } from './dto/user-payouts.dto';

@Injectable()
export class UserPayoutsService {
    constructor(
        @InjectRepository(UserPayout)
        private userPayoutRepo: Repository<UserPayout>,
    ) { }

    async getUserPayouts(user_id: string) {
        const userPayouts: any[] = await this.userPayoutRepo.find({ where: { user: { id: user_id } }, relations: ['payoutMethod'] });
        const result = userPayouts?.map((payout) => {
            return {
                id: payout.payoutMethod.id,
                name: payout.payoutMethod.name,
                phone_number: '+' + payout.phone_number,
            }
        })
        return result
    }

    async createUserPayout(dto: CreateUserPayoutDto) {
        const phoneNumber = dto.phone_number.replace(/\D/g, '');
        const userPayout = this.userPayoutRepo.create({
            payoutMethodId: dto.payout_method_id,
            phone_number: phoneNumber,
            userId: dto.user_id
        });

        return this.userPayoutRepo.save(userPayout);
    }
}
