import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarBrand } from './entities/car-brand.entity';
import { CreateCarBrandDto } from './dto/create-car-brand.dto';
import { UpdateCarBrandDto } from './dto/update-car-brand.dto';

@Injectable()
export class CarBrandService {
  constructor(
    @InjectRepository(CarBrand)
    private carBrandRepository: Repository<CarBrand>,
  ) {}

  // Create a new car brand
  async create(createCarBrandDto: CreateCarBrandDto): Promise<CarBrand> {
    const carBrand = this.carBrandRepository.create(createCarBrandDto);
    return this.carBrandRepository.save(carBrand);
  }

  // Retrieve all car brands
  async findAll(): Promise<CarBrand[]> {
    return this.carBrandRepository.find();
  }

  // Retrieve a single car brand by ID
  async findOne(id: number): Promise<CarBrand> {
    return this.carBrandRepository.findOne({ where: { id } });
  }

  // Update a car brand by ID
  async update(id: number, updateCarBrandDto: UpdateCarBrandDto): Promise<CarBrand> {
    await this.carBrandRepository.update(id, updateCarBrandDto);
    return this.carBrandRepository.findOne({ where: { id } });
  }

  // Delete a car brand by ID
  async remove(id: number): Promise<void> {
    await this.carBrandRepository.delete(id);
  }
}