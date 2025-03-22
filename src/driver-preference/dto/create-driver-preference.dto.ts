import { IsArray, IsNumber } from 'class-validator';

export class CreateDriverPreferenceDto {
  @IsArray()
  @IsNumber({}, { each: true }) // Ensure each item in the array is a number
  preferenceIds: number[]; // Array of preference IDs
}