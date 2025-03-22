import { PartialType } from '@nestjs/mapped-types';
import { CreateTripSeatDto } from './create-trip-seat.dto';

export class UpdateTripSeatDto extends PartialType(CreateTripSeatDto) {}
