import { Module } from '@nestjs/common';
import { TripSeatsService } from './trip-seats.service';
import { TripSeatsController } from './trip-seats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripSeat } from './entities/trip-seat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TripSeat])],
  controllers: [TripSeatsController],
  providers: [TripSeatsService],
})
export class TripSeatsModule {}
