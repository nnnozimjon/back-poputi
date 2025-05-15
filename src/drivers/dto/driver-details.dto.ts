interface DetailsValue {
    id: number;
    name: string;
}

export class DriverDetailsDto {
    user_id: string;
    plate_number: string;
    car_color: DetailsValue | null;
    car_body_type: DetailsValue | null;
    car_brand: DetailsValue | null;
    car_model: DetailsValue | null;
}