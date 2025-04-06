import { IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @IsPositive()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  departure_city?: string;

  @IsOptional()
  @IsString()
  destination_city?: string;

  @IsOptional()
  @IsPositive()
  passengers?: number;

  @IsOptional()
  @IsString()
  departure_time?: string;

  @IsOptional()
  @IsString()
  type?: 'bus' | 'car';
}