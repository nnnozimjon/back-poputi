import { TripSeat } from 'src/trip-seats/entities/trip-seat.entity';
import { Trip } from 'src/trips/entities/trip.entity';
import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';

  @Entity({ name: 'bookings' })
  export class Booking {
    @PrimaryGeneratedColumn('uuid') // Use UUID for primary key
    id: string; // Unique identifier as UUID
  
    @Column({ nullable: false })
    trip_id: string; // Foreign key to trips table
  
    @Column({ nullable: false })
    client_id: string; // Foreign key to users table
  
    @Column({ nullable: false })
    seat_id: string; // Foreign key to trip_seats table
  
    @Column({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false,
    })
    booking_time: Date; // Timestamp for booking
  
    @Column({
      type: 'enum',
      enum: ['pending', 'confirmed', 'canceled'],
      default: 'pending',
    })
    status: 'pending' | 'confirmed' | 'canceled'; // Booking status
  
    // Relationship with Trip
    @ManyToOne(() => Trip, (trip) => trip.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;
  
    // Relationship with User (Client)
    @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'client_id' })
    client: User;
  
    // Relationship with TripSeat
    @ManyToOne(() => TripSeat, (tripSeat) => tripSeat.bookings, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'seat_id' })
    seat: TripSeat;
  }