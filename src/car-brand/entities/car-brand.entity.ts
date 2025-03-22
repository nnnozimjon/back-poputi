import { CarModel } from 'src/car-model/entities/car-model.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class CarBrand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => CarModel, (carModel) => carModel.brand)
  models: CarModel[];

  @OneToMany(() => Driver, (driver) => driver.carBrand)
  drivers: Driver[];
}
