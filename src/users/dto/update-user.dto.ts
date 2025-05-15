import { PartialType } from '@nestjs/mapped-types';
import { SendOtpCodeDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(SendOtpCodeDto) {}
