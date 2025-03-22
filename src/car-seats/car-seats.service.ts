import { Injectable } from '@nestjs/common';
import { CreateCarSeatDto } from './dto/create-car-seat.dto';
import { UpdateCarSeatDto } from './dto/update-car-seat.dto';

@Injectable()
export class CarSeatsService {
  create(createCarSeatDto: CreateCarSeatDto) {
    return 'This action adds a new carSeat';
  }

  findAll() {
    return `This action returns all carSeats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carSeat`;
  }

  update(id: number, updateCarSeatDto: UpdateCarSeatDto) {
    return `This action updates a #${id} carSeat`;
  }

  remove(id: number) {
    return `This action removes a #${id} carSeat`;
  }
}
