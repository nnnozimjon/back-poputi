import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
    ValidateNested,
} from 'class-validator';

export class SendOtpCodeDto {
    @IsPhoneNumber(null, { message: 'Неверный формат номера телефона' })
    phone_number: string;

    @IsString()
    @IsNotEmpty()
    type: string;
}

class CarSeatDto {
    @IsNumber()
    seat_row: number;

    @IsNumber()
    seat_column: number;

    @IsBoolean()
    is_driver_seat: boolean;
}

class CarDetailsDto {
    @IsString()
    @IsNotEmpty()
    plate_number: string;

    @IsNumber()
    car_color_id: number;

    @IsNumber()
    car_body_type_id: number;

    @IsNumber()
    car_brand_id: number;

    @IsNumber()
    car_model_id: number;
}

export class RegisterPassengerDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    phone_number: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    phone_number: string;

    @IsString()
    @IsNotEmpty()
    street_address: string;

    @IsOptional()
    avatar_image?: any;

    @ValidateNested()
    @Type(() => CarDetailsDto)
    @IsNotEmpty()
    car_details: CarDetailsDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CarSeatDto)
    @IsNotEmpty()
    car_seats: CarSeatDto[];

    @IsString()
    @IsNotEmpty()
    otp_code: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    phone_number: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
