import { Booking } from 'src/booking/entities/booking.entity';
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
  
  @Entity({ name: 'trips' })
  export class Trip {
    @PrimaryGeneratedColumn('uuid') // Use UUID for primary key
    id: string; // Unique identifier as UUID
  
    @Column({ nullable: false })
    driver_id: string; // Foreign key to drivers table
  
    @Column({ length: 100, nullable: false })
    departure_city: string; // City where the trip starts
  
    @Column({ length: 100, nullable: false })
    destination_city: string; // City where the trip ends
  
    @Column({ type: 'timestamp', nullable: false })
    departure_time: Date; // Time when the trip starts
  
    @Column({ type: 'timestamp', nullable: false })
    destination_time: Date; // Time when the trip ends
  
    @Column({ default: false, nullable: false })
    is_sending_package_available: boolean; // Whether package sending is available
  
    @Column({ length: 100, nullable: true })
    description: string; // Optional description of the trip
  
    @Column({
      type: 'enum',
      enum: ['scheduled', 'ongoing', 'completed', 'canceled'],
      default: 'scheduled',
    })
    status: 'scheduled' | 'ongoing' | 'completed' | 'canceled'; // Trip status

    @Column({ 
      type: 'timestamp', 
      nullable: false,
      default: () => 'CURRENT_TIMESTAMP' // Database-generated default
    })
    created_at: Date;
  
    @ManyToOne(() => Driver, (driver) => driver.trips, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'driver_id' })
    driver: Driver;

    @OneToMany(() => TripSeat, (tripSeat) => tripSeat.trip)
    tripSeats: TripSeat[];

    @OneToMany(() => Booking, (booking) => booking.trip)
    bookings: Booking[];
  }