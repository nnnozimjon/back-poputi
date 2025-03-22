import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarColor } from './entities/car-color.entity';
import { CreateCarColorDto } from './dto/create-car-color.dto';
import { UpdateCarColorDto } from './dto/update-car-color.dto';

@Injectable()
export class CarColorService {
  constructor(
    @InjectRepository(CarColor)
    private carColorRepository: Repository<CarColor>,
  ) {}

  // Create a new car color
  async create(createCarColorDto: CreateCarColorDto): Promise<CarColor> {
    const carColor = this.carColorRepository.create(createCarColorDto);
    return this.carColorRepository.save(carColor);
  }

  // Retrieve all car colors
  async findAll(): Promise<CarColor[]> {
    return this.carColorRepository.find();
  }

  // Retrieve a single car color by ID
  async findOne(id: number): Promise<CarColor> {
    return this.carColorRepository.findOne({ where: { id } });
  }

  // Update a car color by ID
  async update(id: number, updateCarColorDto: UpdateCarColorDto): Promise<CarColor> {
    await this.carColorRepository.update(id, updateCarColorDto);
    return this.carColorRepository.findOne({ where: { id } });
  }

  // Delete a car color by ID
  async remove(id: number): Promise<void> {
    await this.carColorRepository.delete(id);
  }
}