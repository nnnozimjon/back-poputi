import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarColorService } from './car-color.service';
import { CreateCarColorDto } from './dto/create-car-color.dto';
import { UpdateCarColorDto } from './dto/update-car-color.dto';

@Controller('car-color')
export class CarColorController {
  constructor(private readonly carColorService: CarColorService) {}

  // @Post()
  // create(@Body() createCarColorDto: CreateCarColorDto) {
  //   return this.carColorService.create(createCarColorDto);
  // }

  @Get()
  findAll() {
    return this.carColorService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.carColorService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCarColorDto: UpdateCarColorDto) {
  //   return this.carColorService.update(+id, updateCarColorDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.carColorService.remove(+id);
  // }
} 
