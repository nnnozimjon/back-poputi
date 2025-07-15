import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

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

  @Post('upload-car-images')
  @UseInterceptors(FilesInterceptor('images', 5, {
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit per file
    }
  }))
  async uploadCarImages(  
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { id } = req['user'];
    
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files uploaded');
    }

    if (files.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed');
    }

    if (files.length < 1) {
      throw new BadRequestException('At least 1 image is required');
    }

    return this.driversService.uploadCarImages(id, files);
  }

  @Get('car-images')
  async getCarImages(@Req() req: Request) {
    const { id } = req['user'];
    return this.driversService.getCarImages(id);
  }

  @Delete('car-images/:imageName')
  async deleteCarImage(@Req() req: Request, @Param('imageName') imageName: string) {
    const { id } = req['user'];
    return this.driversService.deleteCarImage(id, imageName);
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
