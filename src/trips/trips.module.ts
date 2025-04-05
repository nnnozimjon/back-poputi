import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripSeat } from 'src/trip-seats/entities/trip-seat.entity';
import { CarSeat } from 'src/car-seats/entities/car-seat.entity';
import { Driver } from 'src/drivers/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Driver, TripSeat, CarSeat])],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
