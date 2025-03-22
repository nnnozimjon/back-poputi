import { Driver } from 'src/drivers/entities/driver.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class CarColor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Driver, (driver) => driver.carColor)
  drivers: Driver[];
}