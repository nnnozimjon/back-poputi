import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PayoutMethod } from "./entities/payout-method.entity";

@Module({
    imports: [TypeOrmModule.forFeature([PayoutMethod])]
})

export class PayoutMethodModule {}