import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserPayout } from "./entities/user-payouts.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserPayout])]
})

export class UserPayoutsModule {}