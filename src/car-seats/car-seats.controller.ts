import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CarSeatsService } from './car-seats.service';
import { CreateCarSeatDto } from './dto/create-car-seat.dto';
import { UpdateCarSeatDto } from './dto/update-car-seat.dto';

@Controller('car-seats')
export class CarSeatsController {
  constructor(private readonly carSeatsService: CarSeatsService) {}

  @Post()
  async create(@Req() req: Request, @Body() createCarSeatDto: CreateCarSeatDto) {
    const { id: user_id } = req["user"]
    return this.carSeatsService.create(user_id, createCarSeatDto);
  }

  @Get()
  async findAllDriverSeats(@Req() req: Request) {
    const { id: user_id } = req["user"]
    return this.carSeatsService.findAllDriverSeats(user_id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.carSeatsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCarSeatDto: UpdateCarSeatDto) {
  //   return this.carSeatsService.update(+id, updateCarSeatDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.carSeatsService.remove(+id);
  // }
}
