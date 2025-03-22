import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarSeatsService } from './car-seats.service';
import { CreateCarSeatDto } from './dto/create-car-seat.dto';
import { UpdateCarSeatDto } from './dto/update-car-seat.dto';

@Controller('car-seats')
export class CarSeatsController {
  constructor(private readonly carSeatsService: CarSeatsService) {}

  @Post()
  create(@Body() createCarSeatDto: CreateCarSeatDto) {
    return this.carSeatsService.create(createCarSeatDto);
  }

  @Get()
  findAll() {
    return this.carSeatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carSeatsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarSeatDto: UpdateCarSeatDto) {
    return this.carSeatsService.update(+id, updateCarSeatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carSeatsService.remove(+id);
  }
}
