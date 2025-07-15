import { IsArray, IsOptional, ArrayMaxSize, ArrayMinSize } from 'class-validator';

export class UploadCarImagesDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'At least 1 image is required' })
    @ArrayMaxSize(5, { message: 'Maximum 5 images allowed' })
    @IsOptional()
    images?: Express.Multer.File[];
} 