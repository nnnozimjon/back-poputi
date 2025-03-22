import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarBodyTypeService } from './car-body-type.service';
import { CreateCarBodyTypeDto } from './dto/create-car-body-type.dto';
import { UpdateCarBodyTypeDto } from './dto/update-car-body-type.dto';

@Controller('car-body-type')
export class CarBodyTypeController {
  constructor(private readonly carBodyTypeService: CarBodyTypeService) {}

  // @Post()
  // create(@Body() createCarBodyTypeDto: CreateCarBodyTypeDto) {
  //   return this.carBodyTypeService.create(createCarBodyTypeDto);
  // }

  @Get()
  findAll() {
    return this.carBodyTypeService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.carBodyTypeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCarBodyTypeDto: UpdateCarBodyTypeDto) {
  //   return this.carBodyTypeService.update(+id, updateCarBodyTypeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.carBodyTypeService.remove(+id);
  // }
}
