import { PartialType } from '@nestjs/mapped-types';
import { CreateCarBrandDto } from './create-car-brand.dto';

export class UpdateCarBrandDto extends PartialType(CreateCarBrandDto) {}
