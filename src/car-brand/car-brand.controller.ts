import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarBrandService } from './car-brand.service';
import { CreateCarBrandDto } from './dto/create-car-brand.dto';
import { UpdateCarBrandDto } from './dto/update-car-brand.dto';

@Controller('car-brand')
export class CarBrandController {
  constructor(private readonly carBrandService: CarBrandService) {}

  // @Post()
  // create(@Body() createCarBrandDto: CreateCarBrandDto) {
  //   return this.carBrandService.create(createCarBrandDto);
  // }

  @Get()
  findAll() {
    return this.carBrandService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.carBrandService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCarBrandDto: UpdateCarBrandDto) {
  //   return this.carBrandService.update(+id, updateCarBrandDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.carBrandService.remove(+id);
  // }
}
