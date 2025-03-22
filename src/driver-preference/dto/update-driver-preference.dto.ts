import { PartialType } from '@nestjs/mapped-types';
import { CreateDriverPreferenceDto } from './create-driver-preference.dto';

export class UpdateDriverPreferenceDto extends PartialType(CreateDriverPreferenceDto) {}
