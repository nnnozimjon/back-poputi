import { IsNotEmpty, IsUUID, IsArray, IsNumber } from 'class-validator';

export class CreateBookingDto {
    @IsUUID()
    @IsNotEmpty()
    trip_id: string;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsNotEmpty()
    seat_ids: number[];
}
