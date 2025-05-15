import { IsNotEmpty, IsNumber, IsArray, ValidateNested, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class SeatDto {
  @IsNumber()
  @IsNotEmpty()
  seat_row: number;

  @IsNumber()
  @IsNotEmpty()
  seat_column: number;

  @IsBoolean()
  @IsOptional()
  is_driver_seat?: boolean
}

export class CreateCarSeatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats: SeatDto[];
}