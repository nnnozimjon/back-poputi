import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Unique,
} from 'typeorm';
import { Driver } from 'src/drivers/entities/driver.entity';
import { TripSeat } from 'src/trip-seats/entities/trip-seat.entity';

@Entity({ name: 'car_seats' })
@Unique('UQ_DRIVER_SEAT_ROW_COLUMN', ['driver_id', 'seat_row', 'seat_column']) // Add unique constraint
export class CarSeat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    driver_id: string;

    @Column({ type: 'int', nullable: false })
    seat_row: number;

    @Column({ type: 'int', nullable: false })
    seat_column: number;

    @Column({ type: 'boolean', default: false })
    is_driver_seat: boolean;

    @ManyToOne(() => Driver, (driver) => driver.carSeats, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'driver_id' })
    driver: Driver;

    @OneToMany(() => TripSeat, (tripSeat) => tripSeat.carSeat)
    tripSeats: TripSeat[];
}
