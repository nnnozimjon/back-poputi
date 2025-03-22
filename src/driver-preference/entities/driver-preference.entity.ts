import { Driver } from 'src/drivers/entities/driver.entity';
import { Preference } from 'src/preferences/entities/preference.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  
  @Entity({ name: 'driver_preferences' })
  export class DriverPreference {
    @PrimaryGeneratedColumn()
    id: number; // Auto-incremented primary key
  
    @Column({ nullable: false })
    driver_id: string; // Foreign key to drivers table
  
    @Column({ nullable: false })
    preference_id: number; // Foreign key to preferences table
  
    // Relationship with Driver
    @ManyToOne(() => Driver, (driver) => driver.driverPreferences, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'driver_id' })
    driver: Driver;
  
    // Relationship with Preference
    @ManyToOne(() => Preference, (preference) => preference.driverPreferences, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'preference_id' })
    preference: Preference;
  }