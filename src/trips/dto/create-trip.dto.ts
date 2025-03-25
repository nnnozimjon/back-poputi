import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';


export class SeatDto {
    @IsNumber()
    id: number;
  
    @IsBoolean()
    is_driver: boolean;
  }

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  departure_city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  destination_city: string;

  @IsDateString() // Validates ISO 8601 date strings (e.g., "2023-12-31T14:30:00Z")
  @IsNotEmpty()
  departure_time: Date;

  @IsDateString()
  @IsNotEmpty()
  destination_time: Date;

  @IsBoolean()
  @IsOptional() // If the field can be omitted (defaults to `false` per your entity)
  is_sending_package_available?: boolean;

  @IsString()
  @IsOptional() // Optional field
  @MaxLength(100)
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats: SeatDto[]; // Now a flat array!
}