import { IsEmail, IsOptional, IsPhoneNumber, ValidateIf } from 'class-validator';

export class CreateUserDto {
  @ValidateIf((o) => !o.phone_number) // Validate if phoneNumber is not provided
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @ValidateIf((o) => !o.email) // Validate if email is not provided
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  @IsOptional()
  phone_number?: string;
  
  fullname: string
}
