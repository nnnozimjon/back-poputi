import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Trip } from 'src/trips/entities/trip.entity';
import { TripSeat } from 'src/trip-seats/entities/trip-seat.entity';
import { HttpModule } from '@nestjs/axios';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Trip, TripSeat]), HttpModule, SmsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})

export class OrdersModule {}
