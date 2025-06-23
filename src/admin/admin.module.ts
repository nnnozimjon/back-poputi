import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { CarSeat } from '../car-seats/entities/car-seat.entity';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trip, Booking, Driver, CarSeat]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {} 