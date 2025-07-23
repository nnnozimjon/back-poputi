import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserPayout } from "./entities/user-payouts.entity";
import { UserPayoutsController } from "./user-payouts.controller";
import { UserPayoutsService } from "./user-payouts.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserPayout])],
    controllers: [UserPayoutsController],
    providers: [UserPayoutsService],
})

export class UserPayoutsModule {}