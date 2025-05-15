import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    Delete,
    Param,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ImageService } from './image.service';
  
  @Controller('images')
  export class ImageController {
    constructor(private readonly imageService: ImageService) {}
  
    @Post('upload')
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(
      @UploadedFile() file: Express.Multer.File,
      @Body() body: any,
    ) {
      const options = {
        resize: body.resize
          ? { width: Number(body.width), height: Number(body.height) }
          : undefined,
        format: body.format,
        quality: body.quality ? Number(body.quality) : undefined,
      };
  
      return this.imageService.saveImage(file, options);
    }
  
    @Delete(':filename')
    async deleteImage(@Param('filename') filename: string) {
      await this.imageService.deleteImage(filename);
      return { message: 'Image deleted successfully' };
    }
  }