import { Injectable } from '@nestjs/common';
import { CreateTripSeatDto } from './dto/create-trip-seat.dto';
import { UpdateTripSeatDto } from './dto/update-trip-seat.dto';

@Injectable()
export class TripSeatsService {
  create(createTripSeatDto: CreateTripSeatDto) {
    return 'This action adds a new tripSeat';
  }

  findAll() {
    return `This action returns all tripSeats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tripSeat`;
  }

  update(id: number, updateTripSeatDto: UpdateTripSeatDto) {
    return `This action updates a #${id} tripSeat`;
  }

  remove(id: number) {
    return `This action removes a #${id} tripSeat`;
  }
}
