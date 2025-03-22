import { PartialType } from '@nestjs/mapped-types';
import { CreateCarBodyTypeDto } from './create-car-body-type.dto';

export class UpdateCarBodyTypeDto extends PartialType(CreateCarBodyTypeDto) {}
