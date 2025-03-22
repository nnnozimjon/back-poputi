import { Injectable } from '@nestjs/common';
import { CreateCarBodyTypeDto } from './dto/create-car-body-type.dto';
import { UpdateCarBodyTypeDto } from './dto/update-car-body-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CarBodyType } from './entities/car-body-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CarBodyTypeService {
  constructor(
    @InjectRepository(CarBodyType)
    private readonly carBodyTypeRepository: Repository<CarBodyType>
  ){}

  // Create a new car body type
  create(createCarBodyTypeDto: CreateCarBodyTypeDto): Promise<CarBodyType> {
    const carBodyType = this.carBodyTypeRepository.create(createCarBodyTypeDto);
    return this.carBodyTypeRepository.save(carBodyType);
  }

  // Retrieve all car body types
  findAll(): Promise<CarBodyType[]> {
    return this.carBodyTypeRepository.find();
  }

  // Retrieve a single car body type by ID
  findOne(id: number): Promise<CarBodyType> {
    return this.carBodyTypeRepository.findOne({ where: { id } });
  }

  // Update a car body type by ID
  async update(id: number, updateCarBodyTypeDto: UpdateCarBodyTypeDto): Promise<CarBodyType> {
    await this.carBodyTypeRepository.update(id, updateCarBodyTypeDto);
    return this.carBodyTypeRepository.findOne({ where: { id } });
  }

  // Delete a car body type by ID
  async remove(id: number): Promise<void> {
    await this.carBodyTypeRepository.delete(id);
    return null;
  }
}
