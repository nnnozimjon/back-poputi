import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PayoutMethod } from "./entities/payout-method.entity";
import { PayoutMethodsController } from "./payout-methods.controller";
import { PayoutMethodsService } from "./payout-methods.service";

@Module({
    imports: [TypeOrmModule.forFeature([PayoutMethod])],
    controllers: [PayoutMethodsController],
    providers: [PayoutMethodsService],
})

export class PayoutMethodModule {}