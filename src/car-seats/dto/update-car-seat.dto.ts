import { PartialType } from '@nestjs/mapped-types';
import { CreateCarSeatDto } from './create-car-seat.dto';

export class UpdateCarSeatDto extends PartialType(CreateCarSeatDto) {}
