import { Booking } from 'src/booking/entities/booking.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
    phone_number: string;

    @Column({ nullable: false })
    fullname: string;

    @Column({ nullable: true })
    street_address: string;

    @Column({ nullable: true })
    avatar_image: string;

    @Column({ nullable: true })
    passport_image: string;

    @Column({ default: false })
    is_driver: boolean;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    })
    
    status: string;

    @Column({ nullable: true })
    password: string;

    @Column('simple-array', { default: [] })
    roles: string[];

    @OneToMany(() => Driver, (driver) => driver.user)
    drivers: Driver[];

    @OneToMany(() => Booking, (booking) => booking.client)
    bookings: Booking[];
}
