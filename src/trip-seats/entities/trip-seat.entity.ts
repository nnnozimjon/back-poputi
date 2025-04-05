import { Booking } from 'src/booking/entities/booking.entity';
import { CarSeat } from 'src/car-seats/entities/car-seat.entity';
import { Trip } from 'src/trips/entities/trip.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';

@Entity({ name: 'trip_seats' })
export class TripSeat {
    @PrimaryGeneratedColumn() // Use UUID for primary key
    id: number; // Unique identifier as UUID

    @Column({ nullable: false })
    trip_id: string; // Foreign key to trips table

    @Column({ nullable: false })
    seat_id: number; // Foreign key to car_seats table

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    price: number; // Price of the seat

    @Column({
        type: 'enum',
        enum: ['available', 'booked'],
        default: 'available',
    })
    status: 'available' | 'booked'; // Seat status

    // Relationship with Trip
    @ManyToOne(() => Trip, (trip) => trip.tripSeats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    // Relationship with CarSeat
    @ManyToOne(() => CarSeat, (carSeat) => carSeat.tripSeats, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'seat_id' })
    carSeat: CarSeat;

    @OneToMany(() => Booking, (booking) => booking.seat)
    bookings: Booking[];
}
