import { Module } from '@nestjs/common';
import { CarSeatsService } from './car-seats.service';
import { CarSeatsController } from './car-seats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarSeat } from './entities/car-seat.entity';
import { Driver } from 'src/drivers/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarSeat, Driver])],
  controllers: [CarSeatsController],
  providers: [CarSeatsService],
})
export class CarSeatsModule {}
