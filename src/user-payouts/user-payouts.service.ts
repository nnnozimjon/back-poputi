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
    ) {}

    async createUserPayout(dto: CreateUserPayoutDto) {
        const userPayout = this.userPayoutRepo.create(dto);
        return this.userPayoutRepo.save(userPayout);
    }
}
