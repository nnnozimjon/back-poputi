import { Driver } from 'src/drivers/entities/driver.entity';
import { TripSeat } from 'src/trip-seats/entities/trip-seat.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'car_seats' })
export class CarSeat {
  @PrimaryGeneratedColumn('uuid') // Use UUID for primary key
  id: string; // Unique identifier as UUID

  @Column({ nullable: false })
  driver_id: string; // Foreign key to drivers table

  @Column({ type: 'int', nullable: false })
  seat_row: number; // Seat row number

  @Column({ type: 'int', nullable: false })
  seat_column: number; // Seat column number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number; // Price of the seat

  @ManyToOne(() => Driver, (driver) => driver.carSeats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @OneToMany(() => TripSeat, (tripSeat) => tripSeat.carSeat)
  tripSeats: TripSeat[];
}