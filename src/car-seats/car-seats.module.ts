import { Module } from '@nestjs/common';
import { CarSeatsService } from './car-seats.service';
import { CarSeatsController } from './car-seats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarSeat } from './entities/car-seat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarSeat])],
  controllers: [CarSeatsController],
  providers: [CarSeatsService],
})
export class CarSeatsModule {}
