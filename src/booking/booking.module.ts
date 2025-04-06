import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { TripSeat } from 'src/trip-seats/entities/trip-seat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, TripSeat])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
