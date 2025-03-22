import { DriverPreference } from 'src/driver-preference/entities/driver-preference.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'preferences' })
export class Preference {
    @PrimaryGeneratedColumn()
    id: number; // Auto-incremented primary key

    @Column({ unique: true, nullable: false })
    name: string; // Unique name for the preference

    @OneToMany(
        () => DriverPreference,
        (driverPreference) => driverPreference.preference,
    )
    driverPreferences: DriverPreference[];
}
