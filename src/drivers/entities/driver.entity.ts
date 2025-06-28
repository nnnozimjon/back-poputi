import { CarBodyType } from 'src/car-body-type/entities/car-body-type.entity';
import { CarBrand } from 'src/car-brand/entities/car-brand.entity';
import { CarColor } from 'src/car-color/entities/car-color.entity';
import { CarModel } from 'src/car-model/entities/car-model.entity';
import { CarSeat } from 'src/car-seats/entities/car-seat.entity';
import { DriverPreference } from 'src/driver-preference/entities/driver-preference.entity';
import { Trip } from 'src/trips/entities/trip.entity';
import { User } from 'src/users/entities/user.entity';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';

  @Entity({ name: 'drivers' })
  export class Driver {
    @PrimaryGeneratedColumn('uuid')
    id: string; // Unique identifier as UUID
  
    @Column({ unique: true, nullable: false })
    user_id: string; // Unique user ID (foreign key to users table)
  
    @Column({ unique: true, nullable: false })
    plate_number: string; // Unique plate number

    @Column({ nullable: true })
    car_image: string; // URL of the car image

    @Column({ nullable: true })
    driver_license_image: string; // URL of the driver's license image

    @Column({ nullable: false })
    car_color_id: number; // Foreign key to car_color table
  
    @Column({ nullable: false })
    car_body_type_id: number; // Foreign key to car_body_type table
  
    @Column({ nullable: false })
    car_brand_id: number; // Foreign key to car_brand table
  
    @Column({ nullable: false })
    car_model_id: number; // Foreign key to car_model table
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    registered_at: Date; // Timestamp for registration
  
    // Relationships
    @ManyToOne(() => User, (user) => user.drivers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => CarColor, (carColor) => carColor.drivers, {
      onDelete: 'NO ACTION',
    })
    @JoinColumn({ name: 'car_color_id' })
    carColor: CarColor;
  
    @ManyToOne(() => CarBodyType, (carBodyType) => carBodyType.drivers, {
      onDelete: 'NO ACTION',
    })
    @JoinColumn({ name: 'car_body_type_id' })
    carBodyType: CarBodyType;
  
    @ManyToOne(() => CarBrand, (carBrand) => carBrand.drivers, {
      onDelete: 'NO ACTION',
    })
    @JoinColumn({ name: 'car_brand_id' })
    carBrand: CarBrand;
  
    @ManyToOne(() => CarModel, (carModel) => carModel.drivers, {
      onDelete: 'NO ACTION',
    })
    @JoinColumn({ name: 'car_model_id' })
    carModel: CarModel;

    @OneToMany(() => CarSeat, (carSeat) => carSeat.driver)
    carSeats: CarSeat[];

    @OneToMany(() => Trip, (trips) => trips.driver)
    trips: Trip[];

    @OneToMany(() => DriverPreference, (driverPreference) => driverPreference.driver)
    driverPreferences: DriverPreference[];
  }