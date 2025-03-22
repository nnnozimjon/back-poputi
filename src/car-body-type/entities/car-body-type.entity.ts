import { Driver } from 'src/drivers/entities/driver.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class CarBodyType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // Ensure body type names are unique
  name: string;

  @OneToMany(() => Driver, (driver) => driver.carBodyType)
  drivers: Driver[];
}