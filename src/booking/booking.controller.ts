import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Req() req: Request, @Body() createBookingDto: CreateBookingDto) {
    const { id: userId } = req['user'];
    return this.bookingService.create(createBookingDto, userId);
  }

  // @Get()
  // findAll() {
  //   return this.bookingService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.bookingService.findOne(id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
  //   return this.bookingService.update(id, updateBookingDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bookingService.remove(id);
  // }
}
