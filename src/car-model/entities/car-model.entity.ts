import { CarBrand } from 'src/car-brand/entities/car-brand.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class CarModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => CarBrand, (carBrand) => carBrand.models, { onDelete: 'NO ACTION' })
  brand: CarBrand;

  @OneToMany(() => Driver, (driver) => driver.carModel)
  drivers: Driver[];
}