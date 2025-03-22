import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TripSeatsService } from './trip-seats.service';
import { CreateTripSeatDto } from './dto/create-trip-seat.dto';
import { UpdateTripSeatDto } from './dto/update-trip-seat.dto';

@Controller('trip-seats')
export class TripSeatsController {
  constructor(private readonly tripSeatsService: TripSeatsService) {}

  @Post()
  create(@Body() createTripSeatDto: CreateTripSeatDto) {
    return this.tripSeatsService.create(createTripSeatDto);
  }

  @Get()
  findAll() {
    return this.tripSeatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripSeatsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTripSeatDto: UpdateTripSeatDto) {
    return this.tripSeatsService.update(+id, updateTripSeatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripSeatsService.remove(+id);
  }
}
