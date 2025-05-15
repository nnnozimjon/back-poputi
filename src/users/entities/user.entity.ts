import { Booking } from "src/booking/entities/booking.entity";
import { Driver } from "src/drivers/entities/driver.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;  // Unique identifier as UUID

    @Column({ unique: true, nullable: true })
    email: string;  // For login/registration

    @Column({ unique: true, nullable: true})
    phone_number: string; // For login/registration

    @Column({ nullable: true })
    fullname: string;  // Unique display name

    @Column({ nullable: true })
    street_address: string;  // Unique display name

    @Column({ nullable: true })
    avatar_image: string;  // URL of the avatar image

    @Column({ nullable: true })
    passport_image: string;  // URL of the passport image

    @Column({ default: false })
    is_driver: boolean;  // Boolean to check if the user is a driver

    @Column({ type: "enum", enum: ["active", "inactive", "suspended"], default: "active" })
    status: string;  // Active/Inactive/Suspended

    @Column("simple-array", { default: [] })
    roles: string[];  // User roles (driver, passenger)

    @OneToMany(() => Driver, (driver) => driver.user)
    drivers: Driver[];

    @OneToMany(() => Booking, (booking) => booking.client)
    bookings: Booking[];
}
