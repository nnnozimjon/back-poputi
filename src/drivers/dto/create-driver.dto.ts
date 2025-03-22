import { IsUUID, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateDriverDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string; // Unique user ID (foreign key to users table)

  @IsString()
  @IsNotEmpty()
  plate_number: string; // Unique plate number

  @IsNumber()
  @IsNotEmpty()
  car_color_id: number; // Foreign key to car_color table

  @IsNumber()
  @IsNotEmpty()
  car_body_type_id: number; // Foreign key to car_body_type table

  @IsNumber()
  @IsNotEmpty()
  car_brand_id: number; // Foreign key to car_brand table

  @IsNumber()
  @IsNotEmpty()
  car_model_id: number; // Foreign key to car_model table
}