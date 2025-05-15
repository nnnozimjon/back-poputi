import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get('vehicle-details')
  async userVehicleDetails(@Req() req: Request) {
    const { id } = req['user']
    return this.driversService.userVehicleDetails(id);
  }

  @Put('/update')
  update(@Req() req: Request, @Body() createDriverDto: CreateDriverDto) { 
    const { id } = req['user']
    return this.driversService.update(id, createDriverDto);
  }

  // @Get()
  // findAll() {
  //   return this.driversService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.driversService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
  //   return this.driversService.update(+id, updateDriverDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.driversService.remove(+id);
  // }
}
